# How the SMMGen API Integration Works

This document explains the complete flow of how orders are automatically processed through the SMMGen API after successful payment.

## 📊 Complete Flow Diagram

```
Customer Places Order
        ↓
   Payment via Paystack
        ↓
Payment Verification (/api/paystack/verify)
        ↓
   Payment Successful?
        ↓ YES
Update Order Status → "processing"
        ↓
Get Order Details from Database
        ↓
Map Service to SMMGen Format
   (Instagram + Likes → "instagram_likes")
        ↓
Extract Quantity from Package
   ("1,000 Likes" → 1000)
        ↓
Call SMMGen API
   POST https://api.smmgen.com/api/v2/order
        ↓
SMMGen Creates Order
        ↓
Store SMMGen Order ID
        ↓
Update Order Status → "completed"
```

## 🔧 Component Breakdown

### 1. **Service Mapping** (`lib/smmgen.ts` - `getSMMGenServiceId()`)

**Purpose:** Converts your internal service names to SMMGen service IDs

**How it works:**
```typescript
Input:  Platform = "Instagram", ServiceType = "Likes"
        ↓
Step 1: Map "Instagram" → "instagram"
Step 2: Map "Likes" → "likes"
Step 3: Combine → "instagram_likes"
Output: "instagram_likes"
```

**Example mappings:**
- `Instagram + Likes` → `"instagram_likes"`
- `TikTok + Followers` → `"tiktok_followers"`
- `YouTube + Views` → `"youtube_views"`

**Customization:** You may need to update this function with your actual SMMGen service IDs (they might be numeric like `"1234"` instead of strings).

---

### 2. **Quantity Extraction**

**Purpose:** Extracts the numeric quantity from package names

**How it works:**
```typescript
Input:  Package Name = "1,000 Likes - GHS 10"
        ↓
Step 1: Find numbers with regex: /[\d,]+/
Step 2: Extract: "1,000"
Step 3: Remove commas: "1000"
Step 4: Convert to integer: 1000
Output: 1000
```

**Examples:**
- `"1,000 Likes"` → `1000`
- `"5,000 Followers"` → `5000`
- `"50 Comments"` → `50`

---

### 3. **SMMGen API Call** (`lib/smmgen.ts` - `processSMMGenOrder()`)

**Purpose:** Sends order to SMMGen API

**Request Format:**
```http
POST https://api.smmgen.com/api/v2/order
Headers:
  Content-Type: application/json
  Authorization: Bearer YOUR_API_KEY

Body:
{
  "service": "instagram_likes",
  "link": "https://instagram.com/p/ABC123",
  "quantity": 1000
}
```

**Response Format:**
```json
{
  "order": 12345,
  "status": "pending"
}
```

**What happens:**
1. Validates API key is set
2. Constructs API URL (default: `https://api.smmgen.com/api/v2`)
3. Sends POST request with order details
4. Returns SMMGen order ID if successful
5. Throws error if API call fails

---

### 4. **Automatic Processing** (`app/api/paystack/verify/route.ts`)

**Purpose:** Automatically processes orders after payment verification

**Flow:**
1. **Payment Verification**
   - Verifies payment with Paystack
   - Gets order ID from payment metadata

2. **Database Update**
   - Updates order status to `"processing"`

3. **Order Processing**
   - Fetches order details from database
   - Maps service to SMMGen format
   - Extracts quantity
   - Calls SMMGen API

4. **Final Update**
   - Stores SMMGen order ID in database
   - Updates order status to `"completed"`
   - Records processing timestamp

**Error Handling:**
- If SMMGen API fails, payment verification still succeeds
- Order status remains `"processing"` for manual retry
- Errors are logged but don't block payment confirmation

---

### 5. **Manual Processing** (`app/api/smmgen/process/route.ts`)

**Purpose:** Allows manual reprocessing of orders

**When to use:**
- Automatic processing failed
- Need to retry an order
- Testing the integration

**How to use:**
```bash
POST /api/smmgen/process
Content-Type: application/json

{
  "orderId": "uuid-of-order"
}
```

**Response:**
```json
{
  "success": true,
  "orderId": "uuid",
  "smmgenOrderId": 12345,
  "message": "Order processed successfully"
}
```

---

## 🔄 Complete Example Flow

### Scenario: Customer orders 1,000 Instagram Likes

1. **Customer submits order:**
   ```json
   {
     "platform": "Instagram",
     "service_type": "Likes",
     "package_name": "1,000 Likes - GHS 10",
     "social_media_link": "https://instagram.com/p/ABC123"
   }
   ```

2. **Payment completed → Verification triggered:**
   - Paystack verifies payment: ✅ Success
   - Order ID retrieved: `"abc-123-def"`

3. **Service mapping:**
   ```typescript
   getSMMGenServiceId("Instagram", "Likes")
   → "instagram_likes"
   ```

4. **Quantity extraction:**
   ```typescript
   "1,000 Likes - GHS 10"
   → Extract "1,000"
   → Remove commas: "1000"
   → Parse integer: 1000
   ```

5. **SMMGen API call:**
   ```http
   POST https://api.smmgen.com/api/v2/order
   {
     "service": "instagram_likes",
     "link": "https://instagram.com/p/ABC123",
     "quantity": 1000
   }
   ```

6. **SMMGen response:**
   ```json
   {
     "order": 98765,
     "status": "pending"
   }
   ```

7. **Database update:**
   ```sql
   UPDATE orders SET
     status = 'completed',
     smmgen_order_id = '98765',
     processed_at = '2024-01-15T10:30:00Z'
   WHERE id = 'abc-123-def'
   ```

8. **Result:**
   - Order status: `"completed"`
   - SMMGen order ID: `98765`
   - Order is now being fulfilled by SMMGen

---

## 🛠️ Configuration

### Environment Variables

```env
# Required
SMMGEN_API_KEY=your_api_key_here

# Optional (defaults to https://api.smmgen.com/api/v2)
SMMGEN_API_URL=https://api.smmgen.com/api/v2
```

### Database Fields

After running migration `003_add_smmgen_fields.sql`:
- `smmgen_order_id` - Stores the order ID from SMMGen
- `processed_at` - Timestamp when order was processed

---

## 🐛 Troubleshooting

### Issue: Service mapping fails
**Solution:** Update `getSMMGenServiceId()` with your actual SMMGen service IDs

### Issue: API returns 401 (Unauthorized)
**Solution:** Check your `SMMGEN_API_KEY` is correct and has proper permissions

### Issue: API returns 400 (Bad Request)
**Solution:** 
- Verify service ID format matches SMMGen requirements
- Check link format is valid
- Ensure quantity is a positive number

### Issue: Order not processing automatically
**Solution:**
- Check server logs for errors
- Verify `SMMGEN_API_KEY` is set
- Ensure payment verification is completing
- Try manual processing via `/api/smmgen/process`

---

## 📝 Key Points

1. **Automatic:** Orders process automatically after payment
2. **Non-blocking:** Payment verification succeeds even if SMMGen fails
3. **Retry-able:** Failed orders can be manually reprocessed
4. **Trackable:** SMMGen order IDs are stored for tracking
5. **Flexible:** Service mapping can be customized for your SMMGen panel

---

## 🔗 Related Files

- `lib/smmgen.ts` - Core API functions
- `app/api/paystack/verify/route.ts` - Automatic processing trigger
- `app/api/smmgen/process/route.ts` - Manual processing endpoint
- `scripts/003_add_smmgen_fields.sql` - Database migration
- `SMMGEN_SETUP.md` - Setup instructions

