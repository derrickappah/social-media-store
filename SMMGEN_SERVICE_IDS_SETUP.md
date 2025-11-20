# SMMGen Service IDs Setup Guide

This guide will help you get your actual SMMGen service IDs and configure them correctly.

## ⚠️ Important: Service IDs are Numeric

SMMGen uses **numeric service IDs** (like `1`, `2`, `10`), NOT strings like `"instagram_likes"`.

## Step 1: Get Your Service IDs

### Method 1: Via API Endpoint

1. **Make sure your API key is set:**
   ```env
   SMMGEN_API_KEY=your_api_key_here
   ```

2. **Call the services endpoint:**
   ```bash
   GET http://localhost:3000/api/smmgen/services
   ```

   Or visit in browser: `http://localhost:3000/api/smmgen/services`

3. **Response will show all available services:**
   ```json
   {
     "success": true,
     "services": [
       {
         "service": 1,
         "name": "Instagram Likes",
         "category": "Instagram",
         "rate": "0.10",
         "min": 100,
         "max": 10000
       },
       {
         "service": 2,
         "name": "Instagram Followers",
         "category": "Instagram",
         "rate": "0.15",
         "min": 100,
         "max": 5000
       }
       // ... more services
     ]
   }
   ```

### Method 2: Via SMMGen Panel

1. Log in to your SMMGen panel
2. Go to **Services** or **API** section
3. Find the service you need
4. Note the **Service ID** (numeric)

## Step 2: Update Service ID Mapping

Edit `lib/smmgen.ts` and update the `getSMMGenServiceId()` function:

```typescript
export function getSMMGenServiceId(platform: string, serviceType: string): number | null {
  const serviceMap: Record<string, Record<string, number>> = {
    Instagram: {
      Likes: 123,      // ← Your actual service ID from SMMGen
      Followers: 456,  // ← Your actual service ID from SMMGen
      Comments: 789,   // ← Your actual service ID from SMMGen
      Saves: 101,      // ← Your actual service ID from SMMGen
      Views: 202,      // ← Your actual service ID from SMMGen
    },
    TikTok: {
      Likes: 301,      // ← Your actual service ID from SMMGen
      Followers: 302,  // ← Your actual service ID from SMMGen
      Views: 303,      // ← Your actual service ID from SMMGen
    },
    // ... add more platforms
  }

  return serviceMap[platform]?.[serviceType] || null
}
```

## Step 3: Verify Configuration

1. **Test with a real order:**
   - Place a test order
   - Check server logs for the service ID being used
   - Verify it matches your SMMGen service ID

2. **Check SMMGen panel:**
   - After order is processed, check your SMMGen panel
   - Verify the order was created with correct service

## Example: Finding Instagram Likes Service ID

1. **Call services API:**
   ```bash
   curl http://localhost:3000/api/smmgen/services
   ```

2. **Search for "Instagram Likes" in response:**
   ```json
   {
     "service": 1234,
     "name": "Instagram Likes - High Quality",
     "category": "Instagram"
   }
   ```

3. **Update mapping:**
   ```typescript
   Instagram: {
     Likes: 1234,  // ← Use the service ID from API response
   }
   ```

## Common Service ID Patterns

While service IDs vary by provider, common patterns:

- **Instagram Likes**: Usually low numbers (1-100)
- **Instagram Followers**: Usually 2-200
- **TikTok Services**: Usually 1000+
- **YouTube Services**: Usually 2000+

**But don't assume!** Always get your actual IDs from the API or panel.

## Troubleshooting

### Issue: Service ID not found

**Error:** `Could not map Instagram Likes to SMMGen service ID`

**Solution:**
1. Check if you've updated `getSMMGenServiceId()` with actual IDs
2. Verify platform and service type names match exactly
3. Check services API to see available services

### Issue: Order fails with "Invalid service"

**Error:** SMMGen returns error about invalid service

**Solution:**
1. Verify service ID is correct (numeric, not string)
2. Check if service is available in your SMMGen account
3. Verify service ID hasn't changed in SMMGen panel

### Issue: Can't find service in services list

**Solution:**
1. Service might not be available in your account
2. Check SMMGen panel for available services
3. Contact SMMGen support if service should be available

## Quick Reference

### API Endpoints

- **Get Services:** `GET /api/smmgen/services`
- **Get Balance:** `GET /api/smmgen/balance`
- **Process Order:** `POST /api/smmgen/process`

### Service ID Format

- ✅ **Correct:** `123` (number)
- ❌ **Wrong:** `"instagram_likes"` (string)
- ❌ **Wrong:** `"123"` (string number)

### Update Locations

1. **Service ID Mapping:** `lib/smmgen.ts` → `getSMMGenServiceId()`
2. **API URL:** `.env.local` → `SMMGEN_API_URL` (default: `https://smmgen.com/api/v2`)
3. **API Key:** `.env.local` → `SMMGEN_API_KEY`

## Next Steps

1. ✅ Get your service IDs from `/api/smmgen/services`
2. ✅ Update `lib/smmgen.ts` with actual service IDs
3. ✅ Test with a small order
4. ✅ Verify order appears in SMMGen panel
5. ✅ Monitor for any errors

Once service IDs are configured correctly, orders will process automatically! 🚀

