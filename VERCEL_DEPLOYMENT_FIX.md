# Vercel Deployment Fix Guide

## Current Status
Your package.json and vercel.json are correctly configured. If deployment still fails, follow these steps:

## Step 1: Verify Vercel Project Settings

1. Go to **Vercel Dashboard** → Your Project → **Settings**
2. Navigate to **General** → **Build & Development Settings**
3. Verify these settings:

```
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install --include=dev
```

## Step 2: Set Environment Variables

1. Go to **Settings** → **Environment Variables**
2. Add these variables for **Production**, **Preview**, and **Development**:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Step 3: Clear Build Cache and Redeploy

1. Go to **Deployments** tab
2. Click on the latest deployment
3. Click **⋯** (three dots) → **Redeploy**
4. Check **"Clear build cache"**
5. Click **Redeploy**

## Step 4: Check Build Logs

If deployment fails, check the logs for:
- `vite: command not found` → Settings issue
- TypeScript errors → Code needs fixing
- Missing environment variables → Add in Settings

## Alternative: Manual Vercel CLI Deploy

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

## Common Error Solutions

### Error: "vite: command not found"
**Fix:** Ensure `installCommand` in vercel.json is `npm install --include=dev`

### Error: "Build failed"
**Fix:** Run `npm run build` locally to identify errors

### Error: "404 on routes"
**Fix:** Rewrites in vercel.json handle SPA routing (already configured)

## Verify Local Build

Before deploying, test locally:
```bash
npm install
npm run build
npm run preview
```

If local build works, Vercel should work too.

## Need Help?
Check deployment logs in Vercel Dashboard for specific error messages.
