# Supabase Setup Guide

## Automatic Setup Wizard

When you first deploy the application without Supabase credentials, you'll automatically see the **Supabase Setup Wizard** that guides you through the entire configuration process.

## Manual Setup Instructions

### Step 1: Create a Supabase Account

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project" or "Sign Up"
3. Sign up with GitHub, Google, or email

### Step 2: Create a New Project

1. Once logged in, click "New Project"
2. Fill in the project details:
   - **Name**: Choose a name for your project (e.g., "learning-platform")
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Select the region closest to your users
   - **Pricing Plan**: Select "Free" for development
3. Click "Create new project"
4. Wait 2-3 minutes for your project to be provisioned

### Step 3: Get Your API Credentials

1. In your Supabase project dashboard, click on the **Settings** icon (gear) in the left sidebar
2. Navigate to **API** section
3. You'll find two important values:
   - **Project URL**: Something like `https://xxxxxxxxxxxxx.supabase.co`
   - **anon/public key**: A long JWT token starting with `eyJhbGci...`

### Step 4: Add Environment Variables to Vercel

#### Option A: Using Vercel Dashboard

1. Go to your Vercel project: [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project
3. Click on **Settings** tab
4. Click on **Environment Variables** in the left sidebar
5. Add the following variables:

   **Variable 1:**
   - Key: `VITE_SUPABASE_URL`
   - Value: Your Supabase Project URL
   - Environments: Check all (Production, Preview, Development)

   **Variable 2:**
   - Key: `VITE_SUPABASE_ANON_KEY`
   - Value: Your Supabase anon/public key
   - Environments: Check all (Production, Preview, Development)

6. Click **Save** for each variable
7. Go to **Deployments** tab and click "Redeploy" on your latest deployment

#### Option B: Using Vercel CLI

```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Login to Vercel
vercel login

# Add environment variables
vercel env add VITE_SUPABASE_URL
# Paste your Supabase URL when prompted

vercel env add VITE_SUPABASE_ANON_KEY
# Paste your Supabase anon key when prompted

# Redeploy
vercel --prod
```

### Step 5: Set Up Database Schema

1. In your Supabase dashboard, click on **SQL Editor** in the left sidebar
2. Copy the contents of `src/lib/database-schema.sql` from your project
3. Paste it into the SQL Editor
4. Click **Run** to execute the schema
5. Repeat for `src/lib/database-user-profiles.sql`

### Step 6: Configure Authentication (Optional)

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Enable the authentication methods you want:
   - Email/Password (enabled by default)
   - Google OAuth
   - GitHub OAuth
   - etc.
3. For OAuth providers, you'll need to add their client IDs and secrets

### Step 7: Verify Setup

1. After redeploying, visit your application
2. The Setup Wizard should no longer appear
3. Try signing up for a new account
4. Check your Supabase dashboard under **Authentication** → **Users** to see if the user was created

## Troubleshooting

### Setup Wizard Still Appears After Adding Variables

- Make sure you added the variables to ALL environments (Production, Preview, Development)
- Redeploy your application after adding variables
- Clear your browser cache and hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

### Connection Test Fails

- Double-check that you copied the entire URL and key (no extra spaces)
- Verify the Project URL ends with `.supabase.co`
- Make sure the anon key starts with `eyJhbGci`
- Check that your Supabase project is fully provisioned (not still setting up)

### Database Errors After Setup

- Ensure you ran both SQL schema files in the correct order
- Check the SQL Editor for any error messages
- Verify all tables were created in **Database** → **Tables**

## Testing Your Setup

You can test the connection using the Setup Wizard's "Test Connection" button, or manually:

```bash
# Test with curl
curl https://YOUR_PROJECT_URL.supabase.co/rest/v1/ \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY"

# Should return a 200 or 404 response (both indicate successful connection)
```

## Security Notes

- ✅ The `anon/public` key is safe to use in client-side code
- ✅ Row Level Security (RLS) policies protect your data
- ❌ Never expose your `service_role` key in client-side code
- ❌ Never commit `.env` files with real credentials to Git

## Need Help?

- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Environment Variables Guide](https://vercel.com/docs/concepts/projects/environment-variables)
- Check the application's built-in Setup Wizard for guided assistance
