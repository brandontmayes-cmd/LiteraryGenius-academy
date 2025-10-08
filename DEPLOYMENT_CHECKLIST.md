# Vercel Deployment Checklist

## ✅ Pre-Deployment Checks

### 1. Local Build Test
```bash
npm install
npm run build
```
**Expected:** Build completes without errors

### 2. Files Pushed to GitHub
- ✅ package.json (root folder)
- ✅ vercel.json (root folder)
- ✅ All source files in src/

### 3. Vercel Dashboard Settings

#### Build & Development Settings
```
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install --include=dev
```

#### Environment Variables (Required)
```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

## 🔧 Troubleshooting Steps

### If Build Fails:

1. **Check Build Logs**
   - Vercel Dashboard → Deployments → Click deployment → View logs

2. **Common Errors:**
   - `vite: command not found` → Wrong install command
   - TypeScript errors → Fix code errors locally first
   - Missing env vars → Add in Vercel settings

3. **Clear Cache & Redeploy**
   - Deployments → ⋯ → Redeploy → ✓ Clear build cache

### If Routes Return 404:

- Already fixed with rewrites in vercel.json
- Ensure vercel.json is in root folder

## 🚀 Quick Deploy via CLI

```bash
npm i -g vercel
vercel login
vercel --prod
```

## 📝 What to Check Next

1. Copy the **exact error message** from Vercel build logs
2. Check if build works locally: `npm run build`
3. Verify environment variables are set in Vercel
4. Ensure Framework Preset is set to "Vite"

## Need the Error Message?

Go to: Vercel Dashboard → Deployments → Latest Deployment → Scroll to error
