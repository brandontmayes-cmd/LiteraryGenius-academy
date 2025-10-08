# 🚀 Pre-Deployment Checklist

## Before You Deploy

### 1. Local Testing
- [ ] Run `npm run build` - builds successfully
- [ ] Run `npm run preview` - preview works
- [ ] Test all authentication flows
- [ ] Test parent portal functionality
- [ ] Test on mobile viewport

### 2. Supabase Configuration
- [ ] All SQL migrations run (check `src/lib/*.sql`)
- [ ] RLS policies enabled on all tables
- [ ] Edge functions deployed
- [ ] Email templates configured
- [ ] Site URL ready to update

### 3. Environment Variables Ready
- [ ] `VITE_SUPABASE_URL` from Supabase Dashboard
- [ ] `VITE_SUPABASE_ANON_KEY` from Supabase Dashboard

### 4. GitHub Repository
- [ ] Code pushed to GitHub
- [ ] `.env` file in `.gitignore` (don't commit secrets!)
- [ ] README updated

## Deploy Steps

### Step 1: Build Test
```bash
npm run build
```

### Step 2: Deploy to Vercel
1. Go to https://vercel.com
2. Click "Add New Project"
3. Import GitHub repository
4. Add environment variables
5. Click Deploy

### Step 3: Update Supabase
After getting your Vercel URL:
1. Supabase → Authentication → URL Configuration
2. Update Site URL to: `https://your-app.vercel.app`
3. Add to Redirect URLs: `https://your-app.vercel.app/**`

### Step 4: Test Production
- [ ] Visit live site
- [ ] Sign up new account
- [ ] Test login/logout
- [ ] Test parent access request
- [ ] Test student approval
- [ ] Test parent dashboard

## Post-Deployment

### Optional Enhancements
- [ ] Add custom domain
- [ ] Configure OAuth (Google/GitHub)
- [ ] Set up monitoring/analytics
- [ ] Enable PWA notifications

### Security Verification
- [ ] HTTPS enabled (automatic on Vercel)
- [ ] Environment variables not exposed
- [ ] RLS policies working
- [ ] Email verification enabled

## Need Help?

- **Quick Start**: See `QUICK_DEPLOY.md`
- **Detailed Guide**: See `DEPLOYMENT_GUIDE.md`
- **Supabase Setup**: See `SUPABASE_PRODUCTION_SETUP.sql`

---

**Ready to deploy? Run `npm run build` first!**
