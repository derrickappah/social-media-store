# Database Setup Instructions

This guide will help you set up the database tables and columns needed for the application.

## Step 1: Run Initial Orders Table Migration

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**
   - Click on **SQL Editor** in the left sidebar
   - Click **New query**

3. **Run the Initial Migration**
   - Copy the contents of `scripts/001_create_orders_table.sql`
   - Paste it into the SQL Editor
   - Click **Run** (or press Ctrl+Enter)
   - Wait for the success message

## Step 2: Add User Authentication Support

1. **Run the User ID Migration**
   - In the SQL Editor, create a new query
   - Copy the contents of `scripts/002_add_user_id_to_orders.sql`
   - Paste it into the SQL Editor
   - Click **Run** (or press Ctrl+Enter)
   - Wait for the success message

## Step 3: Add SMMGen Tracking Fields

1. **Run the SMMGen Fields Migration**
   - In the SQL Editor, create a new query
   - Copy the contents of `scripts/003_add_smmgen_fields.sql`
   - Paste it into the SQL Editor
   - Click **Run** (or press Ctrl+Enter)
   - Wait for the success message

## Step 4: Add Pricing Fields

1. **Run the Pricing Fields Migration**
   - In the SQL Editor, create a new query
   - Copy the contents of `scripts/004_add_pricing_fields.sql`
   - Paste it into the SQL Editor
   - Click **Run** (or press Ctrl+Enter)
   - Wait for the success message

## Step 5: Add Quantity Field

1. **Run the Quantity Field Migration**
   - In the SQL Editor, create a new query
   - Copy the contents of `scripts/005_add_quantity_field.sql`
   - Paste it into the SQL Editor
   - Click **Run** (or press Ctrl+Enter)
   - Wait for the success message

## Step 6: Add Payment Confirmed Status

1. **Run the Payment Confirmed Status Migration**
   - In the SQL Editor, create a new query
   - Copy the contents of `scripts/006_add_payment_confirmed_status.sql`
   - Paste it into the SQL Editor
   - Click **Run** (or press Ctrl+Enter)
   - Wait for the success message

## Step 7: Verify the Migration

Run this query to verify the `user_id` column was added:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'orders' AND table_schema = 'public'
ORDER BY ordinal_position;
```

You should see `user_id` in the list with:
- `data_type`: `uuid`
- `is_nullable`: `YES`

## Troubleshooting

### Error: "column already exists"
- This means the migration has already been run
- You can safely ignore this error or skip that part of the migration

### Error: "relation 'orders' does not exist"
- You need to run `001_create_orders_table.sql` first
- Make sure to run migrations in order

### Error: "permission denied"
- Make sure you're running the queries as the database owner
- Check that you have the correct permissions in Supabase

## Quick Setup (All at Once)

If you want to run all migrations at once, you can combine them:

1. Open SQL Editor in Supabase
2. Copy and paste all migration files in order:
   - `001_create_orders_table.sql`
   - `002_add_user_id_to_orders.sql`
   - `003_add_smmgen_fields.sql`
   - `004_add_pricing_fields.sql`
   - `005_add_quantity_field.sql`
   - `006_add_payment_confirmed_status.sql`
3. Click **Run**

## What These Migrations Do

### `001_create_orders_table.sql`
- Creates the `orders` table with all required columns
- Sets up constraints and validation rules
- Creates indexes for performance
- Sets up Row Level Security (RLS) policies

### `002_add_user_id_to_orders.sql`
- Adds `user_id` column to link orders to authenticated users
- Creates index on `user_id` for faster queries
- Updates RLS policies to allow users to view their own orders
- Maintains backward compatibility (user_id is nullable)

### `003_add_smmgen_fields.sql`
- Adds `smmgen_order_id` to track SMMGen order IDs
- Adds `processed_at` timestamp to track when orders were processed

### `004_add_pricing_fields.sql`
- Adds `panel_cost` to store the cost from SMMGen panel
- Adds `panel_currency` to store the currency
- Adds `profit` to calculate profit margin
- Adds `profit_margin` to store profit percentage

### `005_add_quantity_field.sql`
- Adds `quantity` column to store the exact quantity (likes/followers/views)

### `006_add_payment_confirmed_status.sql`
- Adds `payment_confirmed` status to track payment verification
- Enables automatic SMMGen processing after payment confirmation

## After Running Migrations

Once all migrations are complete:
- ✅ Orders can be created with or without user authentication
- ✅ Authenticated users can track their orders
- ✅ Guest users can still place orders
- ✅ Payment confirmation triggers automatic SMMGen processing
- ✅ Order status flow: pending → payment_confirmed → processing → completed
- ✅ All existing functionality will continue to work

