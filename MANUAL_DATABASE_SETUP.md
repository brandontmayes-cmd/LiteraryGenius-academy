# Manual Database Setup Required

I don't have direct access to run SQL queries on your Supabase database. Please follow these steps:

## Steps to Add Missing Columns

1. **Go to your Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project**
3. **Click on "SQL Editor" in the left sidebar**
4. **Click "New Query"**
5. **Copy and paste the SQL from `ADD_USER_PROFILE_COLUMNS.sql`**
6. **Click "Run" or press Ctrl+Enter**

## What This Does

This adds the following columns to your `user_profiles` table:
- `first_name` - User's first name
- `last_name` - User's last name  
- `full_name` - User's full name
- `grade_level` - Student's grade level
- `email_verified` - Whether email is verified (default: false)
- `verification_sent_at` - Timestamp of verification email

## After Running the SQL

Once you've run the SQL successfully, your signup flow will work properly and users will be able to create accounts with all required information.

## Verify It Worked

The SQL includes a verification query at the end that will show you all columns in the user_profiles table. You should see the new columns listed.
