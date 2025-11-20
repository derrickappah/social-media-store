# SMMGen API Troubleshooting Guide

## Error: "fetch failed"

This error typically means your server cannot connect to the SMMGen API. Here's how to fix it:

### Common Causes & Solutions

#### 1. **Network/Firewall Issues**

**Problem:** Your server cannot reach `https://smmgen.com`

**Solutions:**
- Check your internet connection
- Verify you can access https://smmgen.com in a browser
- Check if your firewall is blocking outbound connections
- If using a VPN, try disabling it temporarily

**Test:**
```bash
# Test if you can reach SMMGen
curl https://smmgen.com/api/v2
```

#### 2. **Incorrect API URL**

**Problem:** The API URL might be wrong

**Check your `.env.local`:**
```env
SMMGEN_API_URL=https://smmgen.com/api/v2
```

**Common mistakes:**
- ❌ `https://api.smmgen.com/api/v2` (wrong - no "api" subdomain)
- ✅ `https://smmgen.com/api/v2` (correct)

#### 3. **SSL/Certificate Issues**

**Problem:** Node.js might have issues with SSL certificates

**Solution:** This is usually handled automatically, but if issues persist:
- Update Node.js to latest LTS version
- Check system time is correct (SSL certificates are time-sensitive)

#### 4. **API Key Issues**

**Problem:** API key might be invalid or expired

**Check:**
1. Log in to https://smmgen.com
2. Go to API settings
3. Verify your API key is active
4. Regenerate if needed

#### 5. **Server Environment**

**Problem:** If deploying to Vercel/Netlify, external API calls might be blocked

**Solution:**
- Check hosting platform's network restrictions
- Verify environment variables are set in production
- Check server logs for more details

## Testing the Connection

### Method 1: Test via API Endpoint

Visit: `http://localhost:3000/api/smmgen/services`

Check the response and server logs for detailed error messages.

### Method 2: Test via cURL

```bash
curl -X POST https://smmgen.com/api/v2 \
  -d "key=YOUR_API_KEY" \
  -d "action=services" \
  -H "Content-Type: application/x-www-form-urlencoded"
```

Replace `YOUR_API_KEY` with your actual API key.

### Method 3: Check Server Logs

Look for detailed error messages in your server console:
- `[SMMGen] Fetching services from: ...`
- `[SMMGen] Services fetch error: ...`

## Quick Fixes

### Fix 1: Verify API URL

Make sure in `.env.local`:
```env
SMMGEN_API_URL=https://smmgen.com/api/v2
```

### Fix 2: Test API Key

1. Log in to SMMGen panel
2. Go to API section
3. Copy your API key
4. Update `.env.local`
5. Restart server

### Fix 3: Check Network

1. Open browser
2. Visit: https://smmgen.com
3. If it doesn't load, there's a network issue
4. Check firewall/VPN settings

### Fix 4: Verify Environment Variables

Visit: `http://localhost:3000/api/test`

Check that `SMMGEN_API_KEY` shows as "SET"

## Alternative: Manual Service ID Setup

If you can't fetch services automatically, you can manually set service IDs:

1. **Log in to SMMGen panel**
2. **Go to Services section**
3. **Note down service IDs** for:
   - Instagram Likes
   - Instagram Followers
   - TikTok Followers
   - etc.

4. **Update `lib/smmgen.ts`:**
   ```typescript
   Instagram: {
     Likes: 123,      // ← Your actual service ID
     Followers: 456,  // ← Your actual service ID
   }
   ```

## Still Having Issues?

1. **Check server logs** for detailed error messages
2. **Verify API key** is correct in SMMGen panel
3. **Test API manually** using cURL or Postman
4. **Contact SMMGen support** if API is down
5. **Check SMMGen status page** (if available)

## Expected Behavior

When working correctly:
- `GET /api/smmgen/services` returns list of services
- `GET /api/smmgen/balance` returns account balance
- Orders process automatically after payment

## Next Steps

Once connection is working:
1. ✅ Fetch services to get actual service IDs
2. ✅ Update `lib/smmgen.ts` with real service IDs
3. ✅ Test with a small order
4. ✅ Verify order appears in SMMGen panel



