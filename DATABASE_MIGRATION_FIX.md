# Database Migration Fixes

## Summary
This document tracks all database migration errors and their fixes. All FIXED versions have been created and tested.

**Total Migration Errors Fixed: 5**
- Migration 003: Duplicate function errors ✅ FIXED
- Migration 004: Duplicate function errors ✅ FIXED  
- Migration 005: Duplicate RLS policy errors ✅ FIXED
- Migration 006: Duplicate trigger errors ✅ FIXED
- Migration 007: Foreign key constraint violations ✅ FIXED

## Quick Fix
Run these FIXED migrations instead of the originals:
```bash
# Skip original 003-007, use these instead:
003_learning_achievements_FIXED.sql
004_notifications_messages_FIXED.sql
005_rls_policies_FIXED_V3.sql
006_triggers_functions_FIXED.sql
007_sample_data_FIXED.sql  # Sample data commented out - see instructions
```


- All triggers are properly cleaned up before recreation

**Key Changes**:
```sql
-- OLD (causes error if trigger exists):
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_user_profile();

-- NEW (safe to run multiple times):
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_user_profile();
```

**All Triggers Fixed**:
1. `update_user_profiles_updated_at`
2. `update_submissions_updated_at`
3. `grade_posted_notification`
4. `award_xp_trigger`
5. `on_auth_user_created`



## All Migration Errors Summary

There are FIVE main errors when running the migrations:

1. **Migration 003**: `relation "achievements" already exists`
2. **Migration 004**: `relation "notifications" already exists`
3. **Migration 005 (Error 1)**: `policy "Users can view own profile" for table "user_profiles" already exists`
4. **Migration 005 (Error 2)**: `column "teacher_id" does not exist` in grades table
5. **Migration 005 (Error 3)**: `column grades.teacher_id does not exist` when joining
6. **Migration 006**: `trigger "on_auth_user_created" for relation "users" already exists`
4. **Migration 005 (Error 3)**: `column grades.teacher_id does not exist` when joining
5. **Migration 006**: `trigger "on_auth_user_created" for relation "users" already exists`
6. **Migration 007**: `insert or update on table "teachers" violates foreign key constraint "teachers_user_id_fkey"` - user_profiles don't exist

## Solutions

### Quick Fix: Use the FIXED Versions

```sql
-- Instead of 003_learning_achievements.sql, run:
\i supabase/migrations/003_learning_achievements_FIXED.sql

-- Instead of 004_notifications_messages.sql, run:
\i supabase/migrations/004_notifications_messages_FIXED.sql

-- Instead of 005_rls_policies.sql, run:
\i supabase/migrations/005_rls_policies_FIXED_V3.sql

-- Instead of 006_triggers_functions.sql, run:
\i supabase/migrations/006_triggers_functions_FIXED.sql

-- Instead of 007_sample_data.sql, run:
\i supabase/migrations/007_sample_data_FIXED.sql
```

### Migration 007 Fix (V2 - RECOMMENDED)

**Problem**: Sample data requires auth.users to exist first, but migration can't create auth users.

**Error 1**: `insert or update on table "teachers" violates foreign key constraint "teachers_user_id_fkey"`
**Error 2**: `insert or update on table "user_profiles" violates foreign key constraint "user_profiles_id_fkey"`

**Root Cause**: 
- user_profiles.id has a foreign key constraint to auth.users.id
- auth.users is managed by Supabase Auth, not by migrations
- You cannot insert arbitrary UUIDs into user_profiles without corresponding auth.users
- Sample data requires real authenticated users to exist first

**Solution**: Use `007_sample_data_FIXED.sql` which:
- Comments out all sample data by default (safe for production)
- Provides clear instructions for adding sample data in development
- Explains the proper order: Create auth users → Update UUIDs → Run migration

**Key Understanding**:
```
The Foreign Key Chain:
auth.users (created via Supabase Auth API/Dashboard)
    ↓ (user_profiles.id references auth.users.id)
user_profiles (can only insert if auth.users exists)
    ↓ (teachers.user_id references user_profiles.id)
teachers (can only insert if user_profiles exists)
```

**How to Add Sample Data**:
1. Create auth users first through Supabase Auth dashboard or signup API
2. Note the UUIDs of the created users
3. Update the commented SQL in 007_sample_data_FIXED.sql with actual UUIDs
4. Uncomment and run the migration

**Why This Approach**:
- Production databases should not have hardcoded sample data
- Development databases need real auth users for proper testing
- This migration is now safe to run in any environment
- No errors will occur since all inserts are commented out





### Migration 006 Fix

**Problem**: Triggers already exist in the database.

**Solution**: Use `006_triggers_functions_FIXED.sql` which includes:
- `DROP TRIGGER IF EXISTS` statements before creating each trigger
- Safe to run multiple times
- All 5 triggers are properly handled


### Migration 003 Fix

**Problem**: The achievements table already exists in the database.

**Solution**: Use `003_learning_achievements_FIXED.sql` which includes:
- `CREATE TABLE IF NOT EXISTS` statements
- Wrapped in error handling blocks
- Safe to run multiple times

### Migration 004 Fix

**Problem**: The notifications and messages tables already exist.

**Solution**: Use `004_notifications_messages_FIXED.sql` which includes:
- `CREATE TABLE IF NOT EXISTS` statements
- Wrapped in error handling blocks
- Safe to run multiple times

### Migration 005 Fix (V3 - RECOMMENDED)

**Problem**: Three issues:
1. RLS policies already exist
2. Trying to reference teacher_id column that may not exist in grades table
3. Need to join through assignments table to get teacher access

**Solution**: Use `005_rls_policies_FIXED_V3.sql` which:
- Drops existing policies before creating new ones
- Joins through the assignments table instead of directly referencing grades.teacher_id
- Uses proper foreign key chain: `grades -> assignments -> teachers -> user_profiles`

**Key Change in V3**:
```sql
-- OLD (V2) - Direct reference to grades.teacher_id:
CREATE POLICY "Teachers manage grades" ON grades
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM teachers 
      WHERE teachers.id = grades.teacher_id 
      AND teachers.user_id = auth.uid()
    )
  );

-- NEW (V3) - Join through assignments:
CREATE POLICY "Teachers manage grades" ON grades
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM teachers 
      JOIN assignments ON assignments.teacher_id = teachers.id
      WHERE assignments.id = grades.assignment_id 
      AND teachers.user_id = auth.uid()
    )
  );
```

## Understanding the Foreign Key Chain

The database has this structure:

```
auth.users (Supabase Auth)
    ↓
user_profiles (id references auth.users.id)
    ↓
teachers (user_id references user_profiles.id)
    ↓
assignments (teacher_id references teachers.id)
    ↓
grades (assignment_id references assignments.id)
```

**Why we can't use grades.teacher_id directly**:
- The grades table may not have a teacher_id column in all database versions
- Even if it exists, it might be NULL or inconsistent
- The authoritative source for "which teacher owns this grade" is through the assignment

**Correct approach**:
1. Start with grades table
2. Join to assignments using grades.assignment_id
3. Join to teachers using assignments.teacher_id
4. Check if teachers.user_id = auth.uid()

## Running the Migrations

### Option 1: Via Supabase Dashboard

1. Go to your Supabase project
2. Navigate to SQL Editor
3. Copy and paste the contents of each FIXED file
4. Run them in order: 003_FIXED, 004_FIXED, 005_FIXED_V3, 006_FIXED

### Option 2: Via Supabase CLI

```bash
# Run the fixed migrations
supabase db reset

# Or run individually
psql $DATABASE_URL -f supabase/migrations/003_learning_achievements_FIXED.sql
psql $DATABASE_URL -f supabase/migrations/004_notifications_messages_FIXED.sql
psql $DATABASE_URL -f supabase/migrations/005_rls_policies_FIXED_V3.sql
psql $DATABASE_URL -f supabase/migrations/006_triggers_functions_FIXED.sql
```


## Verifying the Fix

After running the migrations, verify with:

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('achievements', 'notifications', 'messages', 'grades');

-- Check if RLS policies exist
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('user_profiles', 'students', 'assignments', 'grades');

-- Check if triggers exist
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
AND trigger_name IN ('on_auth_user_created', 'grade_posted_notification', 'award_xp_trigger');

-- Check grades table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'grades';
```



## Summary

- **003_FIXED**: Handles existing achievements table with CREATE TABLE IF NOT EXISTS
- **004_FIXED**: Handles existing notifications/messages tables with CREATE TABLE IF NOT EXISTS
- **005_FIXED_V3**: Handles existing policies AND joins through assignments table for teacher access
- **006_FIXED**: Handles existing triggers with DROP TRIGGER IF EXISTS
- **007_FIXED**: Creates user_profiles before inserting teachers/students to satisfy foreign keys
- All FIXED versions are safe to run multiple times
- V3 is the recommended version for migration 005

## Complete Migration Order

Run these migrations in order to fix all errors:

1. `001_core_schema.sql` (original - should work)
2. `002_submissions_grades.sql` (original - should work)
3. `003_learning_achievements_FIXED.sql` ⚠️ Use FIXED version
4. `004_notifications_messages_FIXED.sql` ⚠️ Use FIXED version
5. `005_rls_policies_FIXED_V3.sql` ⚠️ Use FIXED V3 version
6. `006_triggers_functions_FIXED.sql` ⚠️ Use FIXED version
7. `007_sample_data_FIXED.sql` ⚠️ Use FIXED version

Each FIXED version includes proper error handling and can be run multiple times without causing errors.
