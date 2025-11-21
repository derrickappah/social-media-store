# Package-Specific SMMGen Service IDs

This system allows you to configure different SMMGen service IDs for different price packages of the same service type. This is useful when you offer multiple quality tiers or different providers for the same service.

## Example Use Case

You might offer:
- **TikTok Likes - 1,000 likes for GHS 10** → Uses SMMGen service ID `9396` (standard quality)
- **TikTok Likes - 1,000 likes for GHS 15** → Uses SMMGen service ID `9397` (premium quality)
- **TikTok Likes - 1,000 likes for GHS 20** → Uses SMMGen service ID `9398` (ultra premium quality)

All three are "TikTok Likes" but use different SMMGen services, allowing you to offer different quality levels at different prices.

## How It Works

1. **Pricing Configuration** (`lib/pricing.ts`):
   - Each package in `PRICING_CONFIG` now includes a `smmgenServiceId` field
   - This maps each package to its specific SMMGen service ID

2. **Order Processing**:
   - When an order is created, the `package_id` is stored in the database
   - When processing through SMMGen, the system:
     1. First tries to get the service ID from `package_id` (package-specific)
     2. Falls back to platform/service type mapping if package_id not found

3. **Database**:
   - The `package_id` field stores the package identifier
   - Run migration `007_add_package_id_field.sql` to add this field

## Setup Instructions

### Step 1: Run Database Migration

Run the migration to add the `package_id` field:

```sql
-- Run scripts/007_add_package_id_field.sql in Supabase SQL Editor
```

This adds:
- `package_id` column to store the package identifier
- Index for faster lookups

### Step 2: Update Pricing Configuration

Edit `lib/pricing.ts` and add `smmgenServiceId` to each package:

```typescript
export const PRICING_CONFIG: ServicePricing = {
  TikTok: {
    Likes: {
      likes_1k: {
        customerPrice: 10,
        panelCost: 0.1,
        panelCurrency: "USD",
        smmgenServiceId: 9396, // ← Your actual SMMGen service ID
      },
      likes_1k_premium: {  // ← New package with different price
        customerPrice: 15,
        panelCost: 0.15,
        panelCurrency: "USD",
        smmgenServiceId: 9397, // ← Different SMMGen service ID
      },
      likes_1k_ultra: {  // ← Another package
        customerPrice: 20,
        panelCost: 0.2,
        panelCurrency: "USD",
        smmgenServiceId: 9398, // ← Different SMMGen service ID
      },
    },
  },
}
```

### Step 3: Update Package Definitions

In your order form or products configuration, make sure each package has a unique `id` that matches the `packageId` in `PRICING_CONFIG`:

```typescript
const packages = [
  {
    id: "likes_1k",  // ← Must match PRICING_CONFIG key
    label: "1,000 Likes",
    price: 10,
    amount: 1000,
  },
  {
    id: "likes_1k_premium",  // ← Must match PRICING_CONFIG key
    label: "1,000 Likes (Premium)",
    price: 15,
    amount: 1000,
  },
  {
    id: "likes_1k_ultra",  // ← Must match PRICING_CONFIG key
    label: "1,000 Likes (Ultra Premium)",
    price: 20,
    amount: 1000,
  },
]
```

### Step 4: Get Your SMMGen Service IDs

1. Visit your SMMGen panel: https://smmgen.com
2. Navigate to the Services section
3. Find the service IDs for each quality tier
4. Update `smmgenServiceId` in `lib/pricing.ts` with the actual IDs

Or use the API to fetch services:

```bash
curl -X POST https://smmgen.com/api/v2 \
  -d "key=YOUR_API_KEY" \
  -d "action=services"
```

## How Orders Are Processed

1. **Order Creation**:
   - Customer selects a package (e.g., "likes_1k_premium")
   - `package_id` is stored in the database

2. **Payment Confirmation**:
   - After payment, order status becomes `payment_confirmed`

3. **SMMGen Processing**:
   - System looks up `package_id` in `PRICING_CONFIG`
   - Gets the `smmgenServiceId` for that specific package
   - Processes order using that service ID

4. **Fallback**:
   - If `package_id` is not found or doesn't have a service ID
   - Falls back to platform/service type mapping (from `lib/smmgen.ts`)

## Benefits

✅ **Flexible Pricing**: Offer multiple quality tiers for the same service  
✅ **Different Providers**: Use different SMMGen services for different packages  
✅ **Better Profit Margins**: Charge more for premium services  
✅ **Backward Compatible**: Falls back to old system if package_id not found

## Troubleshooting

### Issue: Order uses wrong SMMGen service ID

**Check:**
1. Is `package_id` stored correctly in the order?
2. Does the `package_id` match a key in `PRICING_CONFIG`?
3. Is `smmgenServiceId` set for that package?

**Solution:**
- Verify `package_id` in database matches `PRICING_CONFIG` keys
- Ensure `smmgenServiceId` is set correctly
- Check order processing logs for which service ID was used

### Issue: Service ID not found

**Check:**
1. Is the package defined in `PRICING_CONFIG`?
2. Does it have `smmgenServiceId` set?

**Solution:**
- Add the package to `PRICING_CONFIG` with `smmgenServiceId`
- Or ensure fallback mapping exists in `lib/smmgen.ts`

## Migration Notes

- Existing orders without `package_id` will use the fallback system
- New orders will automatically use package-specific service IDs
- You can manually update old orders' `package_id` if needed

