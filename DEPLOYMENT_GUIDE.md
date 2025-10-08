# 🚀 Deployment Guide - Literary Genius Academy

## Pre-Deployment Checklist

### ✅ Step 1: Verify Local Build
```bash
npm run build
```
Ensure build completes without errors.

### ✅ Step 2: Configure Supabase for Production

#### A. Update Authentication Settings
1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Set **Site URL** to your production domain: `https://your-domain.com`
3. Add to **Redirect URLs**:
   - `https://your-domain.com/**`
   - `https://your-domain.com/reset-password`
   - `https://your-domain.com/verify-email`

#### B. Configure OAuth Providers (If Using)

**Google OAuth:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create OAuth 2.0 Client ID
3. Add Authorized JavaScript origins: `https://your-domain.com`
4. Add Authorized redirect URIs: `https://[your-project].supabase.co/auth/v1/callback`
5. Copy Client ID & Secret to Supabase → Authentication → Providers → Google

**GitHub OAuth:**
1. Go to GitHub Settings → Developer Settings → OAuth Apps
2. Create New OAuth App
3. Homepage URL: `https://your-domain.com`
4. Callback URL: `https://[your-project].supabase.co/auth/v1/callback`
5. Copy Client ID & Secret to Supabase → Authentication → Providers → GitHub

#### C. Configure Email Templates
Supabase Dashboard → Authentication → Email Templates
- Update all email templates to use production URL
- Replace `{{ .SiteURL }}` references with your domain

#### D. Verify Edge Functions
```bash
supabase functions list
```
Ensure these are deployed:
- `parent-portal-manager`
- `multi-subject-learning-path-generator`
- `teacher-analytics`

### ✅ Step 3: Deploy to Vercel

#### Option A: Via GitHub (Recommended)
1. Push code to GitHub:
```bash
git add .
git commit -m "Ready for production"
git push origin main
```

2. Go to [Vercel Dashboard](https://vercel.com)
3. Click "Add New Project"
4. Import your GitHub repository
5. Configure project:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

6. Add Environment Variables:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key

7. Click **Deploy**

#### Option B: Via Vercel CLI
```bash
npm i -g vercel
vercel login
vercel --prod
```

### ✅ Step 4: Post-Deployment Verification

1. **Test Authentication:**
   - Sign up with new account
   - Verify email works
   - Test login/logout
   - Test password reset

2. **Test OAuth (if configured):**
   - Google sign-in
   - GitHub sign-in

3. **Test Parent Portal:**
   - Parent sends access request
   - Student receives notification
   - Student approves request
   - Parent views dashboard

4. **Test PWA:**
   - Visit site on mobile
   - Install as app
   - Test offline functionality

5. **Test Notifications:**
   - Assignment submissions
   - Grade updates
   - Parent access requests

### ✅ Step 5: Configure Custom Domain (Optional)

1. In Vercel Dashboard → Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update Supabase Site URL to custom domain

## Environment Variables Reference

```env
VITE_SUPABASE_URL=https://[your-project].supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Troubleshooting

### Build Fails
- Check for TypeScript errors: `npm run type-check`
- Verify all dependencies: `npm install`
- Clear cache: `rm -rf node_modules dist && npm install`

### Authentication Issues
- Verify Site URL in Supabase matches deployment URL
- Check redirect URLs include production domain
- Ensure environment variables are set correctly

### OAuth Not Working
- Verify callback URLs match Supabase project
- Check OAuth app is not in development mode
- Ensure client ID/secret are correct

### Edge Functions Not Working
- Verify functions are deployed: `supabase functions list`
- Check function logs in Supabase Dashboard
- Ensure secrets are set: `supabase secrets list`

## Security Checklist

- ✅ RLS policies enabled on all tables
- ✅ Anon key used (not service role key)
- ✅ HTTPS enforced
- ✅ OAuth apps configured for production
- ✅ Email verification enabled
- ✅ Rate limiting configured in Supabase

## Support

For issues, check:
- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- Project GitHub Issues

---

**🎉 Your Literary Genius Academy is now live!**
