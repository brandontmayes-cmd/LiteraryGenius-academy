# Email Authentication Setup Guide

## Error: "Unsupported provider: provider is not enabled"

This error occurs because email/password authentication is not enabled in your Supabase project.

## How to Fix:

### Step 1: Enable Email Provider in Supabase

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **Authentication** → **Providers** (left sidebar)
4. Find **Email** in the list of providers
5. Toggle it **ON** (enable it)
6. Click **Save**

### Step 2: Configure Email Settings (Optional but Recommended)

1. In the same **Providers** section, click on **Email**
2. Configure these settings:
   - **Enable Email Confirmations**: ON (recommended for security)
   - **Enable Email Change Confirmations**: ON
   - **Secure Email Change**: ON

### Step 3: Set Up Email Templates (Optional)

1. Go to **Authentication** → **Email Templates**
2. Customize the confirmation email template if desired
3. Set your site URL in **Authentication** → **URL Configuration**
   - Site URL: Your production URL (e.g., https://yourapp.com)
   - Redirect URLs: Add your app URLs

### Step 4: Test Authentication

1. Try signing up with a new email address
2. Check your email for the confirmation link
3. Click the link to verify your account
4. You should now be able to sign in

## Current Setup Status

✅ Database tables created
✅ Subscription system with 7-day free trial configured
✅ Authentication context ready
❌ Email provider needs to be enabled in Supabase Dashboard

## After Enabling Email Auth

Once email authentication is enabled:
- Users can sign up with email/password
- They get a 7-day free trial automatically
- Email verification is sent
- After trial, they need to subscribe to continue

## Need Help?

If you continue to have issues:
1. Check Supabase logs in Dashboard → Logs
2. Verify your email settings
3. Make sure your site URL is correctly configured
