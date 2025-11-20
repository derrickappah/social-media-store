# SMMGen API Integration Setup

This guide will help you configure the SMMGen API integration for automatic order processing.

## Overview

After a successful payment, orders are automatically processed through the SMMGen API to fulfill social media services (likes, followers, views, etc.).

## Step 1: Get Your SMMGen API Credentials

1. **Log in to your SMMGen Panel**
   - Access your SMMGen dashboard
   - Navigate to **API Settings** or **Developer Settings**

2. **Generate API Key**
   - Create a new API key or copy your existing one
   - Make sure the API key has permissions to create orders

3. **Get API Base URL**
   - Common SMMGen API URLs:
     - `https://api.smmgen.com/api/v2`
     - `https://your-panel-domain.com/api/v2`
   - Check your SMMGen panel documentation for the exact URL

## Step 2: Configure Environment Variables

Add these to your `.env.local` file:

```env
# SMMGen API Configuration
SMMGEN_API_KEY=your_actual_api_key_here
SMMGEN_API_URL=https://api.smmgen.com/api/v2
```

**For production:**
- Add these same variables to your Vercel/hosting platform environment variables
- Never commit API keys to version control

## Step 3: Map Service IDs

The integration automatically maps your service types to SMMGen service IDs. You may need to customize the mapping in `app/api/smmgen/process/route.ts`.

### Current Service Mapping Format

The system uses this format: `{platform}_{service_type}`

Examples:
- Instagram Likes: `instagram_likes`
- TikTok Followers: `tiktok_followers`
- YouTube Views: `youtube_views`

### Customizing Service IDs

1. **Find your SMMGen Service IDs**
   - Check your SMMGen panel for the exact service IDs
   - They might be numeric (e.g., `1234`) or string-based (e.g., `instagram_likes`)

2. **Update the Mapping Function**
   - Open `app/api/smmgen/process/route.ts`
   - Find the `getSMMGenServiceId()` function
   - Update the service ID mapping to match your SMMGen panel

Example:
```typescript
function getSMMGenServiceId(platform: string, serviceType: string): string | null {
  // Custom mapping based on your SMMGen service IDs
  const serviceMap: Record<string, Record<string, string>> = {
    Instagram: {
      Likes: "1234",      // Your actual SMMGen service ID
      Followers: "1235",
      Comments: "1236",
    },
    TikTok: {
      Followers: "2001",
      Likes: "2002",
      Views: "2003",
    },
    // Add more mappings...
  }
  
  return serviceMap[platform]?.[serviceType] || null
}
```

## Step 4: Run Database Migration

Add the SMMGen tracking fields to your orders table:

1. **Go to Supabase SQL Editor**
2. **Run the migration:**
   - Copy contents of `scripts/003_add_smmgen_fields.sql`
   - Paste and run in SQL Editor

This adds:
- `smmgen_order_id` - Stores the order ID returned from SMMGen
- `processed_at` - Timestamp when order was processed

## Step 5: Test the Integration

1. **Place a test order**
   - Complete payment flow
   - Check server logs for SMMGen API calls

2. **Verify in SMMGen Panel**
   - Check if order appears in your SMMGen dashboard
   - Verify order details are correct

3. **Check Database**
   - Order status should be "processing" or "completed"
   - `smmgen_order_id` should be populated

## API Request Format

The integration sends requests to SMMGen in this format:

```json
{
  "service": "instagram_likes",
  "link": "https://instagram.com/p/...",
  "quantity": 1000
}
```

## API Response Format

Expected response from SMMGen:

```json
{
  "order": 12345,
  "status": "pending"
}
```

## Troubleshooting

### Error: "SMMGEN_API_KEY environment variable is not set"
- Make sure you've added `SMMGEN_API_KEY` to your `.env.local` file
- Restart your development server after adding environment variables
- For production, add it to your hosting platform's environment variables

### Error: "Service mapping not found"
- Update the `getSMMGenServiceId()` function with your actual service IDs
- Check that platform and service type names match exactly

### Error: "SMMGen API error: 401"
- Your API key is invalid or expired
- Check your SMMGen panel for the correct API key
- Ensure the API key has proper permissions

### Error: "SMMGen API error: 400"
- Check the request format matches SMMGen's requirements
- Verify service IDs are correct
- Ensure the link format is valid

### Orders not processing automatically
- Check server logs for errors
- Verify payment verification is completing successfully
- Ensure SMMGen API endpoint is accessible
- Check that order status is being updated correctly

## Manual Order Processing

If automatic processing fails, you can manually process orders:

1. **Via API:**
   ```bash
   POST /api/smmgen/process
   {
     "orderId": "your-order-id"
   }
   ```

2. **Check Order Status:**
   - View orders in `/orders` page
   - Check `smmgen_order_id` field to see if order was created

## Support

For SMMGen API-specific issues:
- Check your SMMGen panel documentation
- Contact SMMGen support for API help
- Verify API endpoint URLs and authentication methods

For integration issues:
- Check server logs for detailed error messages
- Verify environment variables are set correctly
- Ensure database migrations have been run

