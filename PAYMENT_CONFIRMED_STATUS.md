# Payment Confirmed Status

## Overview

A new `payment_confirmed` status has been added to track orders where payment has been verified but SMMGen processing hasn't started yet. This provides better visibility into the order processing pipeline.

## Status Flow

The order status flow is now:

```
pending → payment_confirmed → processing → completed
                                    ↓
                               cancelled
```

### Status Descriptions

1. **`pending`**: Order created, payment not yet initiated
2. **`payment_confirmed`**: Payment verified on Paystack, ready for SMMGen processing
3. **`processing`**: SMMGen order processing in progress
4. **`completed`**: Order fully processed (SMMGen order created successfully)
5. **`cancelled`**: Order cancelled

## Automatic Processing Flow

When payment is confirmed:

1. ✅ **Payment Verified**: Paystack confirms payment success
2. ✅ **Status Updated**: Order status set to `payment_confirmed`
3. ✅ **SMMGen Processing Starts**: Automatically triggered
4. ✅ **Status Updated**: Order status set to `processing`
5. ✅ **SMMGen Order Created**: Order sent to SMMGen API
6. ✅ **Status Updated**: Order status set to `completed` with SMMGen order ID

## Database Migration

Run the migration script to add the new status:

```sql
-- Run in Supabase SQL Editor
-- File: scripts/006_add_payment_confirmed_status.sql
```

Or manually:

```sql
-- Drop existing constraint
alter table public.orders drop constraint if exists valid_status;

-- Recreate with new status
alter table public.orders add constraint valid_status 
  check (status in ('pending', 'payment_confirmed', 'processing', 'completed', 'cancelled'));
```

## Error Handling

If SMMGen processing fails:

- Order status remains `payment_confirmed`
- Payment is still considered successful
- Order can be manually retried or processed later
- Error is logged for debugging

## Benefits

1. **Clear Tracking**: Know exactly when payment is confirmed vs when processing starts
2. **Retry Capability**: Orders stuck in `payment_confirmed` can be manually retried
3. **Better Monitoring**: Track how many orders are waiting for SMMGen processing
4. **Debugging**: Easier to identify where in the pipeline an order is stuck

## Monitoring Queries

### Orders waiting for SMMGen processing:
```sql
select * from orders 
where status = 'payment_confirmed' 
order by created_at desc;
```

### Orders currently processing:
```sql
select * from orders 
where status = 'processing' 
order by created_at desc;
```

### Failed SMMGen processing (payment confirmed but not completed):
```sql
select * from orders 
where status = 'payment_confirmed' 
  and created_at < now() - interval '5 minutes'
order by created_at desc;
```

## Manual Retry

If an order is stuck in `payment_confirmed`, you can manually trigger SMMGen processing:

1. Use the `/api/smmgen/process` endpoint
2. Or update the order status to `processing` and call SMMGen API directly

## Testing

After running the migration:

1. Place a test order
2. Complete payment
3. Check order status in database:
   - Should be `payment_confirmed` immediately after payment
   - Should change to `processing` when SMMGen starts
   - Should change to `completed` when SMMGen finishes

