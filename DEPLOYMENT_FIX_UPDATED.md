# Deployment Fix - Vite Command Not Found

## Root Cause
The error `vite: command not found` occurs because Vercel's production builds skip `devDependencies` by default, but Vite is listed in devDependencies in package.json.

## Error Details
```
sh: line 1: vite: command not found
Error: Command "vite build" exited with 127
```

## Solution Applied
Updated `vercel.json` to explicitly install devDependencies:

```json
"installCommand": "npm install --include=dev"
```

This ensures Vite and other build tools are available during the build process.

## Deploy Steps
1. **Commit and push** the updated vercel.json:
   ```bash
   git add vercel.json
   git commit -m "Fix: Install devDependencies for Vercel build"
   git push origin main
   ```

2. **Vercel will auto-deploy** - Monitor at vercel.com/dashboard

3. **Verify build succeeds** - Check deployment logs for successful build

## Alternative Solutions
If the above doesn't work, try these alternatives:

### Option 1: Move Vite to dependencies
Edit package.json and move these from devDependencies to dependencies:
- vite
- @vitejs/plugin-react-swc
- typescript

### Option 2: Set Environment Variable
In Vercel Dashboard → Settings → Environment Variables:
- Key: `NODE_ENV`
- Value: `development`

### Option 3: Remove custom commands
Delete lines 2-6 from vercel.json and let Vercel auto-detect.

## Verification
After deployment succeeds, test:
- Homepage loads correctly
- All routes work (no 404s)
- Assets load properly
- Environment variables are set
