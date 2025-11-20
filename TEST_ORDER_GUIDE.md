# Test Order Guide

This guide will help you test the complete order flow from start to finish.

## 🧪 Test Order Flow

### Step 1: Place a Test Order

1. **Go to your website:** `http://localhost:3000`
2. **Scroll to the order form** (or click "Order" in navigation)
3. **Fill out the form:**

   **If logged in:**
   - Step 1: Select Social Media Platform (e.g., TikTok)
   - Step 2: Enter Phone Number
   - Step 3: Choose Service & Package (e.g., 1,000 Likes)
   - Step 4: Enter Social Media Link
   - Click "Pay with Paystack"

   **If not logged in:**
   - Step 1: Enter Personal Information (Name, Phone, Email)
   - Step 2: Select Social Media Platform
   - Step 3: Choose Service & Package
   - Click "Pay with Paystack"

### Step 2: Payment (Test Mode)

1. **You'll be redirected to Paystack**
2. **Use Paystack Test Cards:**
   
   **Successful Payment:**
   - Card Number: `4084084084084081`
   - CVV: `408`
   - Expiry: Any future date (e.g., `12/25`)
   - PIN: `0000` (if asked)
   - OTP: `123456` (if asked)

   **Failed Payment (for testing errors):**
   - Card Number: `5060666666666666666`
   - CVV: `123`
   - Expiry: Any future date

3. **Complete payment**

### Step 3: Payment Verification

After payment:
1. **You'll be redirected to:** `/payment/success?reference=xxx`
2. **System automatically:**
   - Verifies payment with Paystack ✅
   - Updates order status to "processing" ✅
   - Processes order through SMMGen API ✅
   - Updates order status to "completed" ✅

### Step 4: Verify Order

1. **Check Database:**
   - Order should be in `orders` table
   - Status should be "completed"
   - `smmgen_order_id` should be populated
   - `quantity` should match your order

2. **Check SMMGen Panel:**
   - Log in to https://smmgen.com
   - Check your orders
   - Verify order was created with correct:
     - Service ID
     - Link
     - Quantity

3. **Check Order Tracking:**
   - If logged in, visit `/orders`
   - You should see your order listed
   - Status should show "Completed"

## 📋 Pre-Test Checklist

Before testing, make sure:

- [ ] All environment variables are set (check `/api/test`)
- [ ] Database migrations are run
- [ ] SMMGen API key is valid
- [ ] Service IDs are configured in `lib/smmgen.ts`
- [ ] Paystack is in test mode (or use test cards)

## 🔍 What to Check During Test

### 1. Order Creation
- ✅ Order is saved to database
- ✅ Quantity is stored correctly
- ✅ Pricing information is saved (if configured)

### 2. Payment Flow
- ✅ Redirects to Paystack
- ✅ Payment page loads
- ✅ Can complete payment with test card
- ✅ Redirects back after payment

### 3. Payment Verification
- ✅ Payment is verified successfully
- ✅ Order status updates to "processing"
- ✅ Then updates to "completed"

### 4. SMMGen Processing
- ✅ Order is sent to SMMGen API
- ✅ SMMGen order ID is stored
- ✅ Order appears in SMMGen panel

## 🐛 Common Test Issues

### Issue: Payment redirects but verification fails

**Check:**
- Is `NEXT_PUBLIC_BASE_URL` set correctly?
- Is callback URL configured in Paystack?
- Check server logs for errors

### Issue: Order not processing through SMMGen

**Check:**
- Is `SMMGEN_API_KEY` set?
- Are service IDs configured correctly?
- Check server logs for SMMGen errors
- Verify SMMGen API is accessible

### Issue: Wrong quantity being sent

**Check:**
- Is `quantity` field populated in database?
- Check package configuration in `order-form.tsx`
- Verify quantity extraction logic

## 📊 Test Order Example

**Test Scenario:**
- Platform: TikTok
- Service: Likes
- Package: 1,000 Likes - GHS 10
- Link: https://tiktok.com/@test/video/123

**Expected Flow:**
1. Order created with `quantity: 1000`
2. Payment: 10 GHS via Paystack
3. Payment verified ✅
4. SMMGen API called:
   ```json
   {
     "service": 10,  // Your TikTok Likes service ID
     "link": "https://tiktok.com/@test/video/123",
     "quantity": 1000
   }
   ```
5. Order completed ✅

## 🎯 Success Criteria

A successful test order should:
- ✅ Be created in database
- ✅ Process payment successfully
- ✅ Be sent to SMMGen API
- ✅ Get SMMGen order ID
- ✅ Appear in SMMGen panel
- ✅ Show as "completed" in order tracking

## 📝 Test Logs to Monitor

Watch your server console for:
- `[v0] Order submission...`
- `[v0] Payment verification...`
- `[v0] Processing order through SMMGen...`
- `[SMMGen] API response...`
- `[v0] SMMGen order processed...`

## 🚀 Ready to Test?

1. Make sure everything is configured
2. Start your server: `npm run dev`
3. Go to: `http://localhost:3000`
4. Place a test order
5. Monitor server logs
6. Check results in database and SMMGen panel

Good luck with your test! 🎉

