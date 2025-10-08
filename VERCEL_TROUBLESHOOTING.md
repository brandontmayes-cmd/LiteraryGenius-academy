# Vercel Deployment Troubleshooting Guide

## Common 404 Error Causes

### 1. Missing Environment Variables ⚠️
**Most Common Issue**: Build fails because Supabase credentials are missing.

**Solution**:
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add these variables for **all environments** (Production, Preview, Development):
   ```
   VITE_SUPABASE_URL = https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY = your-anon-key-here
   ```
3. Redeploy: Deployments → ⋯ menu → Redeploy

### 2. Build Failure
**Check Build Logs**:
1. Vercel Dashboard → Deployments → Click failed deployment
2. Look for errors in the build logs
3. Common errors:
   - TypeScript errors
   - Missing dependencies
   - Import errors

**Solution**: Fix errors and push to GitHub

### 3. Custom Domain Not Configured
If using custom domain:
1. Vercel Dashboard → Settings → Domains
2. Add your domain
3. Update DNS records at your registrar
4. Wait 24-48 hours for DNS propagation

### 4. Deployment Status Issues
- **DEPLOYMENT_NOT_FOUND**: Project not deployed or deleted
- **DEPLOYMENT_BLOCKED**: Build failed or blocked by Vercel
- **DNS_HOSTNAME_NOT_FOUND**: Custom domain DNS not configured

## Quick Fix Checklist

- [ ] Environment variables added in Vercel
- [ ] Latest code pushed to GitHub
- [ ] Build succeeds locally (`npm run build`)
- [ ] No TypeScript errors (`npm run lint`)
- [ ] Supabase project is active
- [ ] Redeploy triggered after adding env vars

## Get Help
- Check build logs in Vercel Dashboard
- Review error messages carefully
- Ensure all dependencies are in package.json
