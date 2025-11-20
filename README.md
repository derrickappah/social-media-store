# Social media store

*Automatically synced with your [v0.app](https://v0.app) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/derrickappah00000-9591s-projects/v0-social-media-store)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/projects/mi2z2TmYYIz)

## Overview

This repository will stay in sync with your deployed chats on [v0.app](https://v0.app).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.app](https://v0.app).

## Deployment

Your project is live at:

**[https://vercel.com/derrickappah00000-9591s-projects/v0-social-media-store](https://vercel.com/derrickappah00000-9591s-projects/v0-social-media-store)**

## Build your app

Continue building your app on:

**[https://v0.app/chat/projects/mi2z2TmYYIz](https://v0.app/chat/projects/mi2z2TmYYIz)**

## Environment Variables

Create a `.env.local` file in the project root with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Paystack Configuration
PAYSTACK_SECRET_KEY=your_paystack_secret_key

# SMMGen API Configuration
SMMGEN_API_KEY=your_smmgen_api_key
SMMGEN_API_URL=https://smmgen.com/api/v2

# App Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

**Getting your API keys:**
- **Supabase**: https://supabase.com/dashboard → Your Project → Settings → API
- **Paystack**: https://dashboard.paystack.com/settings/developer
- **SMMGen**: 
  1. Log in to https://smmgen.com
  2. Go to **API** or **Settings** section
  3. Copy your **API Key**
  4. Paste into `SMMGEN_API_KEY`
- **BASE_URL**: Use `http://localhost:3000` for development, your production URL for deployment

**📖 For detailed environment setup instructions, see [ENV_SETUP.md](./ENV_SETUP.md)**

## Google Authentication Setup

**📖 For detailed step-by-step instructions, see [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md)**

Quick setup:

1. **Google Cloud Console:**
   - Create OAuth 2.0 credentials
   - Add redirect URI: `https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback`

2. **Supabase Dashboard:**
   - Go to **Authentication** → **Providers**
   - Enable **Google** provider
   - Add Client ID and Client Secret from Google Cloud Console

**⚠️ If you see "provider is not enabled" error:**
- Make sure Google provider is toggled **ON** in Supabase
- Check the detailed setup guide: `GOOGLE_OAUTH_SETUP.md`

## Database Setup

**📖 For detailed database setup instructions, see [DATABASE_SETUP.md](./DATABASE_SETUP.md)**

Quick setup:

1. **Go to Supabase SQL Editor**
   - Open your Supabase project dashboard
   - Navigate to **SQL Editor** → **New query**

2. **Run migrations in order:**
   - First: Copy and run `scripts/001_create_orders_table.sql`
   - Then: Copy and run `scripts/002_add_user_id_to_orders.sql`

**⚠️ If you see "Could not find the 'user_id' column" error:**
- You need to run the migration script `002_add_user_id_to_orders.sql`
- See `DATABASE_SETUP.md` for detailed instructions

## How It Works

1. Create and modify your project using [v0.app](https://v0.app)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository
