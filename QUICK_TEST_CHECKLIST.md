# Quick Test Order Checklist

## ✅ Pre-Test Setup

Before placing a test order, verify:

- [ ] **Environment Variables Set:**
  - `SMMGEN_API_KEY` is set
  - `SMMGEN_API_URL=https://smmgen.com/api/v2` (correct URL)
  - `PAYSTACK_SECRET_KEY` is set
  - `NEXT_PUBLIC_SUPABASE_URL` is set
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set

- [ ] **Database Migrations Run:**
  - `001_create_orders_table.sql` ✅
  - `002_add_user_id_to_orders.sql` ✅
  - `003_add_smmgen_fields.sql` ✅
  - `004_add_pricing_fields.sql` ✅
  - `005_add_quantity_field.sql` ✅

- [ ] **Service IDs Configured:**
  - Updated `lib/smmgen.ts` with your actual SMMGen service IDs
  - Or test with default IDs (will need to update later)

- [ ] **Server Running:**
  - Development server is running
  - No errors in console

## 🧪 Test Order Steps

### 1. Go to Order Form
- Visit: `http://localhost:3000`
- Scroll to order form section

### 2. Fill Out Form

**Example Test Order:**
- **Platform:** TikTok (or any)
- **Service:** Likes
- **Package:** 1,000 Likes - GHS 10
- **Link:** `https://tiktok.com/@test/video/123` (use a real or test link)
- **Personal Info:** (if not logged in)
  - Name: Test User
  - Phone: 0551234567
  - Email: test@example.com

### 3. Submit Order
- Click "Pay with Paystack"
- You'll be redirected to Paystack

### 4. Complete Payment

**Use Paystack Test Card:**
- **Card Number:** `4084084084084081`
- **CVV:** `408`
- **Expiry:** Any future date (e.g., `12/25`)
- **PIN:** `0000` (if asked)
- **OTP:** `123456` (if asked)

### 5. Wait for Redirect
- After payment, you'll be redirected back
- Should go to: `/payment/success?reference=xxx`

### 6. Check Results

**In Browser:**
- Should see "Payment Successful!" message
- Order ID should be displayed

**In Server Console:**
Look for these logs:
```
[v0] Verifying payment with reference: ...
[v0] Payment verified on Paystack
[v0] Processing order through SMMGen: ...
[SMMGen] Sending order request: ...
[v0] SMMGen order processed: ...
```

**In Database:**
- Order status should be "completed"
- `smmgen_order_id` should be populated
- `quantity` should match your order

**In SMMGen Panel:**
- Log in to https://smmgen.com
- Check your orders
- Verify order was created

## 🔍 What to Monitor

### Server Logs
Watch for:
- ✅ Payment verification success
- ✅ Order processing started
- ✅ SMMGen API call
- ✅ SMMGen response received
- ✅ Order marked as completed

### Database
Check order table:
- ✅ Order exists
- ✅ Status = "completed"
- ✅ Quantity is correct
- ✅ SMMGen order ID is set

### SMMGen Panel
- ✅ Order appears in panel
- ✅ Service ID is correct
- ✅ Quantity matches
- ✅ Link is correct

## ⚠️ Common Test Issues

### Issue: Payment succeeds but order not processing

**Check:**
- Server logs for SMMGen errors
- Is `SMMGEN_API_KEY` set?
- Are service IDs configured?

**Solution:**
- Check server console for detailed errors
- Verify SMMGen API key is valid
- Update service IDs in `lib/smmgen.ts`

### Issue: Wrong service ID error

**Solution:**
- Get actual service IDs from SMMGen panel
- Update `lib/smmgen.ts` with correct IDs
- Or call `/api/smmgen/services` to get IDs

### Issue: Quantity is wrong

**Check:**
- Database `quantity` field
- Package configuration in `order-form.tsx`

**Solution:**
- Run migration `005_add_quantity_field.sql`
- Verify packages have `amount` field set

## 🎯 Success Indicators

A successful test order will show:
- ✅ Payment page loads
- ✅ Payment completes successfully
- ✅ Redirects back to success page
- ✅ Shows "Payment Successful!"
- ✅ Server logs show SMMGen processing
- ✅ Order in database with status "completed"
- ✅ SMMGen order ID stored
- ✅ Order appears in SMMGen panel

## 📝 Test Order Example

**Test Data:**
```
Platform: TikTok
Service: Likes
Package: 1,000 Likes - GHS 10
Link: https://tiktok.com/@test/video/1234567890
Name: Test User
Phone: 0551234567
Email: test@example.com
```

**Expected Result:**
- Order created with quantity: 1000
- Payment: 10 GHS
- SMMGen order created with:
  - Service: [Your TikTok Likes service ID]
  - Link: https://tiktok.com/@test/video/1234567890
  - Quantity: 1000

## 🚀 Ready to Test?

1. ✅ All environment variables set
2. ✅ Database migrations run
3. ✅ Service IDs configured (or use defaults for testing)
4. ✅ Server is running
5. ✅ Go to: `http://localhost:3000`
6. ✅ Place your test order!

Good luck! 🎉

