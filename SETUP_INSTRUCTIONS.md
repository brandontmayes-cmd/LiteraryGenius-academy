# Critical Setup Instructions

## Issue: Parent Accounts Showing Student Dashboard

### Root Cause
The `user_profiles` table is missing required columns that were added after the initial schema creation.

### Solution
Run the following SQL in your Supabase Dashboard (SQL Editor):

```sql
-- Add missing columns to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS grade_level TEXT,
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS verification_sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;

-- Verify the columns were added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
ORDER BY ordinal_position;
```

### After Running SQL
1. **Test Parent Signup**: Create a new parent account
2. **Verify Role**: Check that the dashboard shows "Parent Dashboard" not "Student Dashboard"
3. **Check Database**: In Supabase Table Editor, verify the user_profiles row has role='parent'

## Issue: Diagnostic Test Shows No Questions

### Causes
1. Edge function may not be returning questions properly
2. Standards data may not be loaded in database

### Solutions

#### Option 1: Check Standards Data
```sql
-- Verify standards exist
SELECT COUNT(*) FROM common_core_standards;

-- If count is 0, you need to import standards data
```

#### Option 2: Use Fallback Questions
The diagnostic test now includes fallback sample questions if the edge function fails. This ensures tests always work even without standards data.

## Issue: Cannot Access Standards-Based Questions

### Solution
A new **Standards Browser** component has been added. Access it from:
- Student Dashboard → "Practice Standards" tab
- Teacher Dashboard → "Standards Alignment" section

The browser allows you to:
- Search standards by code or description
- Filter by grade level and subject
- Select standards to generate practice questions

## Deployment Checklist

1. ✅ Run the SQL script above in Supabase
2. ✅ Push code changes to repository
3. ✅ Verify Vercel auto-deploys
4. ✅ Test parent signup after deployment
5. ✅ Test diagnostic test loads questions
6. ✅ Verify standards browser works

## Testing Instructions

### Test Parent Account
1. Sign up with role="Parent"
2. Verify email and login
3. Should see "Parent Dashboard" with child management features

### Test Diagnostic Test
1. Login as student
2. Go to "Diagnostic Test" tab
3. Test should load within 5 seconds
4. Should show questions (either from AI or fallback)

### Test Standards Browser
1. Login as student or teacher
2. Navigate to Standards section
3. Should see list of Common Core standards
4. Search and filter should work
