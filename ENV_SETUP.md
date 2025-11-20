# Environment Variables Setup Guide

This guide will help you configure all the environment variables needed for the social media store application.

## Quick Setup

Create a `.env.local` file in the project root with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Paystack Configuration
PAYSTACK_SECRET_KEY=your_paystack_secret_key_here

# SMMGen API Configuration
SMMGEN_API_KEY=your_smmgen_api_key_here
SMMGEN_API_URL=https://smmgen.com/api/v2

# App Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000
GHS_TO_USD_EXCHANGE_RATE=12
```

## Detailed Setup Instructions

### 1. Supabase Configuration

**Getting your Supabase credentials:**

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project (or create a new one)
3. Go to **Settings** → **API**
4. Copy the following:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Example:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0NTIzNDU2NywiZXhwIjoxOTYwODEwNTY3fQ.example
```

### 2. Paystack Configuration

**Getting your Paystack Secret Key:**

1. Log in to [Paystack Dashboard](https://dashboard.paystack.com)
2. Go to **Settings** → **API Keys & Webhooks**
3. Copy your **Secret Key** (starts with `sk_test_` or `sk_live_`)
4. Paste into `PAYSTACK_SECRET_KEY`

**Note:**
- Use `sk_test_` for testing/development
- Use `sk_live_` for production

**Example:**
```env
PAYSTACK_SECRET_KEY=your_paystack_secret_key_here
```

### 3. SMMGen API Configuration

**Getting your SMMGen API Key:**

1. Log in to your SMMGen panel (e.g., https://smmgen.com)
2. Navigate to **API Settings** or **Developer Settings**
3. Copy your **API Key**
4. Paste into `SMMGEN_API_KEY`

**API URL:**
- Default: `https://smmgen.com/api/v2`
- Check your SMMGen panel documentation for the exact URL

**Example:**
```env
SMMGEN_API_KEY=your_smmgen_api_key_here
SMMGEN_API_URL=https://smmgen.com/api/v2
```

### 4. App Configuration

**NEXT_PUBLIC_BASE_URL:**
- Development: `http://localhost:3000`
- Production: Your production URL (e.g., `https://yourdomain.com`)

**GHS_TO_USD_EXCHANGE_RATE:**
- Current exchange rate from Ghana Cedis (GHS) to US Dollars (USD)
- Used for pricing calculations
- Update this regularly to reflect current rates

**Example:**
```env
NEXT_PUBLIC_BASE_URL=http://localhost:3000
GHS_TO_USD_EXCHANGE_RATE=12
```

## Complete Example

Here's a complete `.env.local` example:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0NTIzNDU2NywiZXhwIjoxOTYwODEwNTY3fQ.example

# Paystack Configuration
PAYSTACK_SECRET_KEY=your_paystack_secret_key_here

# SMMGen API Configuration
SMMGEN_API_KEY=your_smmgen_api_key_here
SMMGEN_API_URL=https://smmgen.com/api/v2

# App Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000
GHS_TO_USD_EXCHANGE_RATE=12
```

## Production Deployment

When deploying to production (Vercel, Netlify, etc.):

1. **Add environment variables in your hosting platform:**
   - Go to your project settings
   - Navigate to **Environment Variables**
   - Add all the variables from `.env.local`

2. **Update `NEXT_PUBLIC_BASE_URL`:**
   - Change to your production URL
   - Example: `https://yourdomain.com`

3. **Use production API keys:**
   - Use `sk_live_` for Paystack (not `sk_test_`)
   - Use production SMMGen API key

## Security Notes

⚠️ **Important:**
- Never commit `.env.local` to version control
- The `.gitignore` file is configured to exclude `.env*` files
- Keep your API keys secret and secure
- Rotate keys if they're ever exposed

## Verification

After setting up environment variables:

1. **Restart your development server:**
   ```bash
   npm run dev
   ```

2. **Test the configuration:**
   - Visit: `http://localhost:3000/api/test`
   - Should show all environment variables as "SET"

3. **Check for errors:**
   - Look for any missing variable warnings in the console
   - Fix any issues before proceeding

## Troubleshooting

### Error: "Environment variable not set"

**Solution:**
- Check that `.env.local` exists in the project root
- Verify the variable name is spelled correctly
- Restart the development server after adding variables

### Error: "Invalid API key"

**Solution:**
- Double-check you copied the entire key
- Verify there are no extra spaces
- Make sure you're using the correct key type (test vs live)

### Variables not loading

**Solution:**
- Make sure the file is named exactly `.env.local` (not `.env`)
- Restart the development server
- Check that variables start with `NEXT_PUBLIC_` if they need to be accessible in the browser

## Next Steps

After setting up environment variables:

1. ✅ Run database migrations (see [DATABASE_SETUP.md](./DATABASE_SETUP.md))
2. ✅ Configure SMMGen service IDs (see [SMMGEN_SERVICE_IDS_SETUP.md](./SMMGEN_SERVICE_IDS_SETUP.md))
3. ✅ Set up Google OAuth (optional, see README.md)
4. ✅ Test the application (see [TEST_ORDER_GUIDE.md](./TEST_ORDER_GUIDE.md))

