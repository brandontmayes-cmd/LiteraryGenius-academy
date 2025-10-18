# Email Authentication Setup Guide

## Overview
This guide walks you through enabling and configuring Email authentication in your Supabase project.

## Step 1: Enable Email Provider

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project

2. **Navigate to Authentication Providers**
   - Click **Authentication** in the left sidebar
   - Click **Providers** tab
   - Scroll to find **Email** provider

3. **Enable Email Authentication**
   - Email provider should be **enabled by default**
   - If disabled, toggle it **ON**
   - Click **Save**

## Step 2: Configure Email Confirmation Settings

1. **Go to Authentication Settings**
   - Click **Authentication** → **Providers**
   - Find **Email** provider settings

2. **Configure Confirmation Options**
   - **Confirm email**: Toggle ON (recommended for production)
     - Users must verify email before signing in
   - **Secure email change**: Toggle ON (recommended)
     - Requires confirmation for email changes
   - **Double confirm email changes**: Toggle ON (extra security)
     - Requires confirmation on both old and new email

3. **Click Save**

## Step 3: Configure Site URL and Redirect URLs

1. **Navigate to URL Configuration**
   - Go to **Authentication** → **URL Configuration**

2. **Set Site URL**
   ```
   Production: https://your-app.vercel.app
   Development: http://localhost:5173
   ```

3. **Add Redirect URLs** (comma-separated)
   ```
   http://localhost:5173/**
   https://your-app.vercel.app/**
   ```

4. **Click Save**

## Step 4: Configure Email Templates

1. **Navigate to Email Templates**
   - Go to **Authentication** → **Email Templates**

2. **Customize Confirmation Email**
   - Select **Confirm signup** template
   - Default template includes:
     - Confirmation link with token
     - Expires in 24 hours
   
3. **Available Variables**
   ```
   {{ .ConfirmationURL }} - Verification link
   {{ .Token }} - Verification token
   {{ .Email }} - User's email
   {{ .SiteURL }} - Your app URL
   ```

4. **Example Custom Template**
   ```html
   <h2>Confirm your signup</h2>
   <p>Follow this link to confirm your email:</p>
   <p><a href="{{ .ConfirmationURL }}">Confirm Email</a></p>
   <p>Or copy and paste this URL:</p>
   <p>{{ .ConfirmationURL }}</p>
   ```

5. **Other Email Templates to Configure**
   - **Magic Link**: For passwordless login
   - **Change Email Address**: Email change confirmation
   - **Reset Password**: Password reset emails

## Step 5: Configure Email Rate Limits (Optional)

1. **Go to Authentication Settings**
   - Click **Authentication** → **Rate Limits**

2. **Set Rate Limits**
   - Email sent per hour: 4 (default)
   - Prevents abuse and spam

## Step 6: Test Email Authentication

1. **Test Signup Flow**
   - Go to your app
   - Click Sign Up
   - Enter email and password
   - Check email for confirmation link

2. **Verify Email Delivery**
   - Check spam folder if not received
   - Confirmation link expires in 24 hours

3. **Check Supabase Logs**
   - Go to **Authentication** → **Users**
   - New user should appear with status
   - Status: "Waiting for verification" until confirmed

## Troubleshooting

### Email Not Sending

**Issue**: Confirmation emails not being delivered

**Solutions**:
1. Check spam/junk folder
2. Verify Site URL is correct in Supabase settings
3. Check Supabase email quota (free tier has limits)
4. Configure custom SMTP for production (recommended)

### Custom SMTP Setup (Production)

1. **Navigate to Project Settings**
   - Go to **Project Settings** → **Auth**
   - Scroll to **SMTP Settings**

2. **Configure SMTP**
   ```
   Host: smtp.your-provider.com
   Port: 587
   Username: your-smtp-username
   Password: your-smtp-password
   Sender email: noreply@yourdomain.com
   Sender name: Your App Name
   ```

3. **Recommended SMTP Providers**
   - SendGrid (free tier: 100 emails/day)
   - Mailgun (free tier: 5,000 emails/month)
   - AWS SES (very affordable)
   - Resend (modern, developer-friendly)

### Confirmation Link Not Working

**Issue**: Clicking confirmation link shows error

**Solutions**:
1. Verify redirect URLs include your domain
2. Check Site URL matches your deployment
3. Ensure link hasn't expired (24 hour limit)
4. Check browser console for errors

### "Provider Not Enabled" Error

**Issue**: Getting provider error despite email being enabled

**Solutions**:
1. Verify environment variables in Vercel:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
2. Redeploy after changing Supabase settings
3. Clear browser cache and cookies
4. Check you're using correct Supabase project

## Environment Variables Checklist

Ensure these are set in your `.env.local` and Vercel:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Quick Verification Checklist

- [ ] Email provider is enabled in Supabase
- [ ] Email confirmation is configured
- [ ] Site URL is set correctly
- [ ] Redirect URLs include your domains
- [ ] Email templates are configured
- [ ] Environment variables are set in Vercel
- [ ] App has been redeployed after changes
- [ ] Test signup creates user in Supabase
- [ ] Confirmation email is received
- [ ] Confirmation link works correctly

## Next Steps

After enabling email authentication:
1. Test the complete signup flow
2. Test password reset flow
3. Configure custom email templates for branding
4. Set up custom SMTP for production
5. Monitor email delivery in Supabase logs

## Support

If issues persist:
- Check Supabase Status: https://status.supabase.com
- Supabase Docs: https://supabase.com/docs/guides/auth
- Community: https://github.com/supabase/supabase/discussions
