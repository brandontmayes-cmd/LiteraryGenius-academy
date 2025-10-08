# Build & Deployment Error Resolution

## 🔴 Current Issue: 404 Errors on Vercel

### Root Cause Analysis
The 404 error typically means one of these issues:

1. **Build Failed** - Most common cause
2. **Environment Variables Missing** - Prevents successful build
3. **Deployment Not Found** - Project not properly deployed
4. **DNS Issues** - Custom domain not configured

---

## ✅ Step-by-Step Fix

### Step 1: Check Vercel Build Status
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your project
3. Go to **Deployments** tab
4. Check if latest deployment shows:
   - ✅ **Ready** (green) = Deployed successfully
   - ❌ **Failed** (red) = Build error
   - 🟡 **Building** (yellow) = In progress

### Step 2: Add Missing Environment Variables
**This is the #1 cause of build failures**

1. In Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Add these variables:

```
Name: VITE_SUPABASE_URL
Value: https://your-project-ref.supabase.co
Environments: ✓ Production ✓ Preview ✓ Development
```

```
Name: VITE_SUPABASE_ANON_KEY  
Value: your-anon-key-from-supabase
Environments: ✓ Production ✓ Preview ✓ Development
```

3. Get values from: [Supabase Dashboard](https://supabase.com/dashboard) → Your Project → Settings → API

### Step 3: Trigger Redeploy
After adding environment variables:
1. Go to **Deployments** tab
2. Click **⋯** (three dots) on latest deployment
3. Click **Redeploy**
4. Wait for build to complete

### Step 4: Verify Build Logs
If build fails:
1. Click on the failed deployment
2. Scroll through build logs
3. Look for error messages (usually in red)
4. Common errors and fixes below

---

## 🐛 Common Build Errors

### Error: "Missing Supabase environment variables"
**Fix**: Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (see Step 2)

### Error: "Module not found" or "Cannot find module"
**Fix**: 
```bash
npm install
git add package-lock.json
git commit -m "Update dependencies"
git push
```

### Error: TypeScript errors
**Fix**: Run locally first:
```bash
npm run lint
npm run build
```
Fix any errors, then push to GitHub

---

## 🌐 Custom Domain Issues

If using custom domain and getting 404:

1. **Verify Domain Added**:
   - Vercel → Settings → Domains
   - Your domain should be listed

2. **Check DNS Records**:
   - Add these at your domain registrar:
   ```
   Type: CNAME
   Name: www (or @)
   Value: cname.vercel-dns.com
   ```

3. **Wait for DNS Propagation**: 24-48 hours

4. **Test DNS**: https://dnschecker.org

---

## 🚀 Quick Test

Test if your app builds locally:
```bash
npm install
npm run build
npm run preview
```

If this works, the issue is with Vercel configuration, not your code.

---

## 📞 Still Having Issues?

1. Check Vercel Status: https://www.vercel-status.com
2. Review build logs carefully
3. Ensure GitHub repository is connected
4. Try deploying from Vercel CLI:
   ```bash
   npm i -g vercel
   vercel --prod
   ```
