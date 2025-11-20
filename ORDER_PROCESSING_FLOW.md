# Order Processing Flow - Complete Guide

This document explains the complete automated order processing system that triggers when payment is confirmed.

## 🔄 Complete Automated Flow

```
1. Customer Places Order
   ├─ Selects: Instagram, 1,000 Likes
   ├─ Quantity stored: 1000
   └─ Order saved with status: "pending"

2. Customer Pays via Paystack
   └─ Redirected to Paystack payment page

3. Payment Completed
   └─ Paystack redirects to: /payment/success?reference=xxx

4. Payment Verification (Automatic)
   ├─ POST /api/paystack/verify
   ├─ Verifies payment with Paystack API
   └─ Gets orderId from payment metadata

5. Payment Confirmed ✅
   ├─ Order status updated: "pending" → "processing"
   └─ Order details fetched from database

6. SMMGen Processing (Automatic)
   ├─ Service mapping: Instagram + Likes → "instagram_likes"
   ├─ Quantity retrieved: 1000 (from database)
   ├─ API call to SMMGen:
   │  {
   │    "service": "instagram_likes",
   │    "link": "https://instagram.com/p/...",
   │    "quantity": 1000
   │  }
   └─ SMMGen creates order and returns order ID

7. Order Completed ✅
   ├─ SMMGen order ID stored
   ├─ Processing timestamp recorded
   └─ Order status: "processing" → "completed"
```

## 📋 Step-by-Step Breakdown

### Step 1: Order Creation

When customer submits order form:

```typescript
// Order is created with:
{
  platform: "Instagram",
  service_type: "Likes",
  package_name: "1,000 Likes - GHS 10",
  package_price: 10,
  quantity: 1000,  // ← Stored directly from package
  social_media_link: "https://instagram.com/p/...",
  status: "pending"
}
```

**Key Point:** Quantity is stored in the database when order is created, making it reliable for processing.

### Step 2: Payment Verification

When customer returns from Paystack:

```typescript
// Payment verification endpoint receives:
POST /api/paystack/verify
{
  "reference": "paystack_reference_123"
}

// Verifies with Paystack:
GET https://api.paystack.co/transaction/verify/paystack_reference_123

// Response includes orderId in metadata:
{
  "data": {
    "status": "success",
    "metadata": {
      "orderId": "abc-123-def"
    }
  }
}
```

### Step 3: Order Processing

After payment verification succeeds:

```typescript
// 1. Update order status
UPDATE orders SET status = 'processing' WHERE id = 'abc-123-def'

// 2. Fetch order details
SELECT * FROM orders WHERE id = 'abc-123-def'
// Returns: { platform, service_type, quantity, social_media_link, ... }

// 3. Map to SMMGen format
getSMMGenServiceId("Instagram", "Likes")
→ "instagram_likes"

// 4. Get quantity
quantity = orderDetails.quantity  // 1000

// 5. Call SMMGen API
POST https://api.smmgen.com/api/v2/order
{
  "service": "instagram_likes",
  "link": "https://instagram.com/p/...",
  "quantity": 1000  // ← Exact number of likes/followers/views
}

// 6. SMMGen Response
{
  "order": 98765,
  "status": "pending"
}

// 7. Update order
UPDATE orders SET
  status = 'completed',
  smmgen_order_id = '98765',
  processed_at = '2024-01-15T10:30:00Z'
WHERE id = 'abc-123-def'
```

## 🎯 Key Features

### 1. **Automatic Processing**
- No manual intervention needed
- Orders process immediately after payment confirmation
- Works 24/7 automatically

### 2. **Reliable Quantity Tracking**
- Quantity stored in database when order is created
- No need to parse package names
- Fallback parsing if quantity not stored

### 3. **Error Handling**
- Payment verification succeeds even if SMMGen fails
- Failed orders remain in "processing" status
- Can be manually retried via `/api/smmgen/process`

### 4. **Complete Tracking**
- SMMGen order ID stored for reference
- Processing timestamp recorded
- All order details preserved

## 📊 Example: Complete Order Lifecycle

### Customer Orders: 5,000 TikTok Followers

**1. Order Created:**
```json
{
  "id": "order-123",
  "platform": "TikTok",
  "service_type": "Followers",
  "package_name": "5,000 Followers - GHS 100",
  "quantity": 5000,
  "package_price": 100,
  "status": "pending"
}
```

**2. Payment Completed:**
- Customer pays 100 GHS via Paystack
- Paystack reference: `ref_abc123`

**3. Payment Verified:**
```http
POST /api/paystack/verify
{ "reference": "ref_abc123" }

Response:
{
  "status": "success",
  "orderId": "order-123"
}
```

**4. SMMGen Processing:**
```http
POST https://api.smmgen.com/api/v2/order
{
  "service": "tiktok_followers",
  "link": "https://tiktok.com/@user/video/123",
  "quantity": 5000
}

Response:
{
  "order": 45678,
  "status": "pending"
}
```

**5. Order Completed:**
```json
{
  "id": "order-123",
  "status": "completed",
  "smmgen_order_id": "45678",
  "processed_at": "2024-01-15T10:30:00Z",
  "quantity": 5000
}
```

## 🔧 Configuration

### Required Environment Variables

```env
# Paystack
PAYSTACK_SECRET_KEY=sk_live_xxx

# SMMGen API
SMMGEN_API_KEY=your_api_key
SMMGEN_API_URL=https://api.smmgen.com/api/v2
```

### Database Fields

After running migrations:
- `quantity` - Number of likes/followers/views
- `smmgen_order_id` - Order ID from SMMGen
- `processed_at` - When order was processed
- `status` - Order status (pending → processing → completed)

## 🐛 Troubleshooting

### Issue: Orders not processing automatically

**Check:**
1. Is `SMMGEN_API_KEY` set in environment variables?
2. Check server logs for errors
3. Verify payment verification is completing
4. Check if order has quantity field populated

**Solution:**
- Verify environment variables are set
- Check SMMGen API key is valid
- Ensure service mapping is correct
- Run database migration to add quantity field

### Issue: Wrong quantity being sent

**Check:**
1. Is quantity stored correctly in database?
2. Check package configuration in `order-form.tsx`
3. Verify quantity extraction logic

**Solution:**
- Run migration `005_add_quantity_field.sql`
- Verify packages have `amount` field set
- Check order in database has correct quantity

### Issue: SMMGen API errors

**Check:**
1. Is API key valid?
2. Is service ID correct?
3. Is link format valid?
4. Is quantity a positive number?

**Solution:**
- Verify API key in SMMGen panel
- Check service ID mapping in `lib/smmgen.ts`
- Ensure social media link is valid
- Verify quantity > 0

## 📝 Manual Processing

If automatic processing fails, you can manually process:

```bash
POST /api/smmgen/process
{
  "orderId": "order-123"
}
```

This will:
1. Fetch order from database
2. Map service to SMMGen format
3. Get quantity from database
4. Process through SMMGen API
5. Update order status

## ✅ Verification Checklist

After setup, verify:

- [ ] Orders are created with `quantity` field
- [ ] Payment verification works correctly
- [ ] Orders automatically process after payment
- [ ] SMMGen order IDs are stored
- [ ] Order status updates correctly
- [ ] Error handling works (payment succeeds even if SMMGen fails)

## 🚀 Next Steps

1. ✅ Run database migration `005_add_quantity_field.sql`
2. ✅ Verify quantity is stored when orders are created
3. ✅ Test with a real payment
4. ✅ Check SMMGen panel for processed orders
5. ✅ Monitor logs for any errors
6. ✅ Set up error alerts if needed

The system is now fully automated - orders will process automatically when payment is confirmed! 🎉

