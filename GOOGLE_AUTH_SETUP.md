# Google OAuth Setup Guide for Supabase

## The Problem
You're getting "Unsupported provider: provider is not enabled" when trying to sign up with Google because the Google OAuth provider is not enabled in your Supabase project.

## Step-by-Step Solution

### 1. Open Supabase Dashboard
- Go to https://supabase.com/dashboard
- Select your project: **Literary Genius Academy**

### 2. Navigate to Authentication Providers
- Click **Authentication** in the left sidebar
- Click **Providers** (under Configuration)
- Scroll down to find **Google** in the provider list

### 3. Enable Google Provider
- Click on **Google** to expand it
- Toggle **Enable Sign in with Google** to **ON**

### 4. Configure Google OAuth Credentials

You have two options:

#### Option A: Use Supabase's Google OAuth (Easiest)
- Supabase provides default Google OAuth credentials for development
- Just toggle it ON and click **Save**
- This works immediately but shows "Supabase" branding

#### Option B: Use Your Own Google OAuth Credentials (Recommended for Production)

1. **Create Google OAuth Credentials:**
   - Go to https://console.cloud.google.com/
   - Create a new project or select existing
   - Go to **APIs & Services** → **Credentials**
   - Click **Create Credentials** → **OAuth 2.0 Client ID**
   - Select **Web application**

2. **Configure Authorized URLs:**
   - **Authorized JavaScript origins:**
     ```
     https://ukiftslybaexlikgmodr.supabase.co
     ```
   
   - **Authorized redirect URIs:**
     ```
     https://ukiftslybaexlikgmodr.supabase.co/auth/v1/callback
     ```

3. **Copy Credentials to Supabase:**
   - Copy **Client ID** from Google Console
   - Copy **Client Secret** from Google Console
   - Paste both into Supabase Google provider settings
   - Click **Save**

### 5. Configure Site URL (Important!)
- Still in Supabase Dashboard, go to **Authentication** → **URL Configuration**
- Set **Site URL** to your production URL:
  ```
  https://your-app.vercel.app
  ```
- Add **Redirect URLs** (one per line):
  ```
  https://your-app.vercel.app
  https://your-app.vercel.app/auth/callback
  http://localhost:5173
  http://localhost:5173/auth/callback
  ```

### 6. Test the Integration
1. Clear your browser cache
2. Go to your app
3. Click "Sign Up" or "Sign In"
4. Click "Continue with Google"
5. You should see Google's OAuth consent screen

## Common Issues

### Issue: "Redirect URI mismatch"
**Solution:** Make sure the redirect URI in Google Console exactly matches:
```
https://ukiftslybaexlikgmodr.supabase.co/auth/v1/callback
```

### Issue: "Provider not enabled" persists
**Solution:** 
1. Hard refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)
2. Check that you clicked **Save** in Supabase
3. Wait 1-2 minutes for changes to propagate
4. Redeploy your app on Vercel

### Issue: Works locally but not in production
**Solution:** Make sure your production URL is added to:
1. Supabase Site URL
2. Supabase Redirect URLs
3. Google Console Authorized JavaScript origins
4. Google Console Authorized redirect URIs

## Quick Checklist
- [ ] Google provider enabled in Supabase
- [ ] Site URL configured in Supabase
- [ ] Redirect URLs added in Supabase
- [ ] Google OAuth credentials configured (if using your own)
- [ ] Browser cache cleared
- [ ] App redeployed on Vercel

## Need Help?
If you're still having issues:
1. Check Supabase logs: **Project Settings** → **API** → **Logs**
2. Check browser console for detailed error messages
3. Verify environment variables are set in Vercel
