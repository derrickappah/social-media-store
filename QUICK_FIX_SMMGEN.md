# Quick Fix: SMMGen API Connection Error

## The Problem

Error: `Cannot connect to SMMGen API at https://api.smmgen.com/api/v2`

## The Solution

The API URL in your `.env.local` file is incorrect. It should be:

```env
SMMGEN_API_URL=https://smmgen.com/api/v2
```

**NOT:**
```env
SMMGEN_API_URL=https://api.smmgen.com/api/v2  ❌ WRONG
```

## Quick Fix Steps

### Step 1: Open `.env.local`

Open the `.env.local` file in your project root.

### Step 2: Update the URL

Find this line:
```env
SMMGEN_API_URL=https://api.smmgen.com/api/v2
```

Change it to:
```env
SMMGEN_API_URL=https://smmgen.com/api/v2
```

**Important:** Remove the "api" subdomain - it's just `smmgen.com`, not `api.smmgen.com`

### Step 3: Restart Server

1. Stop your server (Ctrl+C)
2. Start again: `npm run dev` or `pnpm dev`

### Step 4: Test Again

Visit: `http://localhost:3000/api/smmgen/services`

It should now work!

## Complete `.env.local` Example

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key

# Paystack Configuration
PAYSTACK_SECRET_KEY=your_paystack_key

# SMMGen API Configuration
SMMGEN_API_KEY=your_smmgen_api_key
SMMGEN_API_URL=https://smmgen.com/api/v2

# App Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000
GHS_TO_USD_EXCHANGE_RATE=12
```

## Verify

After fixing, check:
1. ✅ URL is `https://smmgen.com/api/v2` (no "api" subdomain)
2. ✅ Server was restarted
3. ✅ `/api/smmgen/services` endpoint works

That's it! The connection should work now. 🎉



