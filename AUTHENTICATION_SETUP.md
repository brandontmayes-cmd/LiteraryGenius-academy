# Authentication Setup Guide

## Overview
Literary Genius Academy now uses **real Supabase authentication** with session persistence and automatic token refresh.

## Setup Instructions

### 1. Environment Variables
Ensure your `.env` file contains:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Database Setup
Run the SQL migration to create the `user_profiles` table:

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `src/lib/database-user-profiles.sql`
4. Click **Run** to execute the migration

### 3. Authentication Flow

#### Registration
- Users sign up with email/password via `supabase.auth.signUp()`
- A profile is automatically created in `user_profiles` table
- User data includes: firstName, lastName, role (student/parent/teacher)

#### Login
- Users sign in with `supabase.auth.signInWithPassword()`
- Session is automatically persisted in localStorage
- User profile is fetched from `user_profiles` table

#### Session Management
- Sessions are automatically refreshed via `onAuthStateChange` listener
- Token refresh happens automatically before expiration
- User remains logged in across page refreshes

#### Logout
- `supabase.auth.signOut()` clears session and tokens
- User is redirected to landing page

## Security Features

### Row Level Security (RLS)
- Users can only view/edit their own profiles
- Teachers can view student profiles
- Parents can view their children's profiles

### Password Requirements
- Handled by Supabase Auth (min 6 characters by default)
- Can be configured in Supabase Dashboard → Authentication → Policies

## Testing

### Test Accounts
Create test accounts for each role:
1. Student: student@test.com
2. Teacher: teacher@test.com
3. Parent: parent@test.com

### Verification
- Check Supabase Dashboard → Authentication → Users
- Verify profiles in Database → user_profiles table
