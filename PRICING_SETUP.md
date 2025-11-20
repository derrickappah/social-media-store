# Pricing Configuration Guide

This guide explains how to configure pricing to handle the markup between what you charge customers and what the SMM panel charges you.

## The Problem

You charge customers **10 GHS** for 1,000 Instagram Likes, but the SMM panel charges you **0.1 USD** (approximately 1.2 GHS at current exchange rates). You need to:

1. Track both prices
2. Calculate profit margins
3. Ensure orders are processed with correct costs

## Solution Overview

The system now tracks:
- **Customer Price** (package_price): What you charge (e.g., 10 GHS)
- **Panel Cost** (panel_cost): What the panel charges (e.g., 0.1 USD)
- **Profit**: Customer price - Panel cost (converted to same currency)
- **Profit Margin**: (Profit / Customer price) × 100

## Configuration

### Step 1: Update Pricing Configuration

Edit `lib/pricing.ts` and update the `PRICING_CONFIG` object with your actual pricing:

```typescript
export const PRICING_CONFIG: ServicePricing = {
  Instagram: {
    Likes: {
      likes_1k: {
        customerPrice: 10,  // GHS 10 (what you charge)
        panelCost: 0.1,     // USD 0.1 (what panel charges)
        panelCurrency: "USD",
      },
      // Add more packages...
    },
  },
}
```

### Step 2: Set Exchange Rate

In `components/order-form.tsx`, update the exchange rate:

```typescript
const exchangeRate = 12 // GHS to USD - update this with current rate
```

**To get current exchange rate:**
- Check: https://www.xe.com/currencyconverter/
- Update this value regularly or make it configurable via environment variable

### Step 3: Run Database Migration

Run the migration to add pricing fields:

```sql
-- Run scripts/004_add_pricing_fields.sql in Supabase SQL Editor
```

This adds:
- `panel_cost` - Cost from SMM panel
- `panel_currency` - Currency of panel cost (default: USD)
- `profit` - Calculated profit
- `profit_margin` - Profit as percentage

## How It Works

### 1. Order Creation

When a customer places an order:

```typescript
// Customer selects: 1,000 Instagram Likes - GHS 10
// System looks up pricing config
const pricing = getPricingConfig("Instagram", "Likes", "likes_1k")
// Returns: { customerPrice: 10, panelCost: 0.1, panelCurrency: "USD" }

// Order is saved with:
// - package_price: 10 (GHS)
// - panel_cost: 0.1 (USD)
// - profit: 10 - (0.1 × 12) = 8.8 GHS
// - profit_margin: (8.8 / 10) × 100 = 88%
```

### 2. Order Processing

When payment is verified:

1. System extracts quantity from package name: "1,000 Likes" → 1000
2. Sends to SMMGen API with quantity (not price)
3. Panel processes order and charges your account 0.1 USD
4. Order marked as completed

### 3. Profit Tracking

All orders now track:
- What you charged the customer
- What the panel charged you
- Your profit and margin

## Example Configuration

### Instagram Likes

```typescript
Instagram: {
  Likes: {
    likes_1k: {
      customerPrice: 10,    // You charge 10 GHS
      panelCost: 0.1,       // Panel charges 0.1 USD
      panelCurrency: "USD",
    },
    likes_5k: {
      customerPrice: 45,    // You charge 45 GHS
      panelCost: 0.4,       // Panel charges 0.4 USD
      panelCurrency: "USD",
    },
    likes_10k: {
      customerPrice: 80,    // You charge 80 GHS
      panelCost: 0.7,       // Panel charges 0.7 USD
      panelCurrency: "USD",
    },
  },
}
```

### Calculation Example

For 1,000 Likes:
- **Customer pays:** 10 GHS
- **Panel costs:** 0.1 USD = 1.2 GHS (at 12 GHS/USD)
- **Your profit:** 10 - 1.2 = 8.8 GHS
- **Profit margin:** 88%

## Updating Prices

### To Change Customer Prices

1. Update `components/order-form.tsx` - `products` object
2. Update `lib/pricing.ts` - `PRICING_CONFIG` customerPrice values

### To Change Panel Costs

1. Update `lib/pricing.ts` - `PRICING_CONFIG` panelCost values
2. System will automatically recalculate profit for new orders

## Environment Variable (Optional)

You can make the exchange rate configurable:

```env
# .env.local
GHS_TO_USD_EXCHANGE_RATE=12
```

Then in code:
```typescript
const exchangeRate = parseFloat(process.env.GHS_TO_USD_EXCHANGE_RATE || "12")
```

## Verifying Configuration

### Check Order in Database

After placing a test order, check the database:

```sql
SELECT 
  package_name,
  package_price,
  panel_cost,
  panel_currency,
  profit,
  profit_margin
FROM orders
WHERE id = 'your-order-id';
```

You should see:
- `package_price`: 10 (GHS)
- `panel_cost`: 0.1 (USD)
- `profit`: ~8.8 (GHS)
- `profit_margin`: ~88 (%)

## Troubleshooting

### Issue: Panel cost is null

**Solution:** 
- Check that package ID matches in `PRICING_CONFIG`
- Verify platform and service type names match exactly
- Check console logs for mapping errors

### Issue: Profit calculation is wrong

**Solution:**
- Update exchange rate in `components/order-form.tsx`
- Verify panel cost values in `PRICING_CONFIG`
- Check currency conversion is correct

### Issue: Orders not processing

**Solution:**
- Verify SMMGen API key is set
- Check service ID mapping in `lib/smmgen.ts`
- Ensure quantity extraction is working (check logs)

## Best Practices

1. **Update Exchange Rate Regularly**
   - Currency rates change daily
   - Update weekly or use an API to fetch current rates

2. **Monitor Profit Margins**
   - Track average profit per order
   - Adjust customer prices if margins are too low

3. **Review Panel Costs**
   - Panel prices may change
   - Update `PRICING_CONFIG` when panel updates prices

4. **Test Before Going Live**
   - Place test orders
   - Verify all pricing fields are populated
   - Check profit calculations are correct

## Next Steps

1. ✅ Update `lib/pricing.ts` with your actual pricing
2. ✅ Set exchange rate in `components/order-form.tsx`
3. ✅ Run database migration `004_add_pricing_fields.sql`
4. ✅ Test with a real order
5. ✅ Verify pricing fields in database
6. ✅ Monitor profit margins

