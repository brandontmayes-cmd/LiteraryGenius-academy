# ⚡ Quick Deploy - 5 Minutes to Live

## 1️⃣ Build Locally (30 seconds)
```bash
npm run build
```
✅ Ensure no errors

## 2️⃣ Push to GitHub (1 minute)
```bash
git add .
git commit -m "Production ready"
git push origin main
```

## 3️⃣ Deploy to Vercel (2 minutes)

### Go to [vercel.com](https://vercel.com)
1. Click **"Add New Project"**
2. Import your GitHub repo
3. Framework: **Vite** (auto-detected)
4. Add Environment Variables:
   ```
   VITE_SUPABASE_URL = https://[your-project].supabase.co
   VITE_SUPABASE_ANON_KEY = your-anon-key
   ```
5. Click **Deploy** 🚀

## 4️⃣ Update Supabase (1 minute)

### Go to [Supabase Dashboard](https://supabase.com/dashboard)
1. **Authentication → URL Configuration**
   - Site URL: `https://your-vercel-app.vercel.app`
   - Redirect URLs: Add `https://your-vercel-app.vercel.app/**`

## 5️⃣ Test (30 seconds)
- ✅ Visit your live site
- ✅ Sign up / Login
- ✅ Test parent portal

## 🎉 You're Live!

### Next Steps (Optional):
- Add custom domain in Vercel
- Configure OAuth (Google/GitHub)
- Set up email templates
- Enable PWA notifications

### Get Your Supabase Credentials:
Supabase Dashboard → Settings → API
- Project URL = `VITE_SUPABASE_URL`
- anon/public key = `VITE_SUPABASE_ANON_KEY`

---

**Need help?** See `DEPLOYMENT_GUIDE.md` for detailed instructions.
