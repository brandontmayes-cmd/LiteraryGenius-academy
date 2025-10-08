# 🚀 Quick Database Setup (5 Minutes)

## Step 1: Open Supabase Dashboard
1. Go to [supabase.com](https://supabase.com)
2. Sign in to your project
3. Click **SQL Editor** in the left sidebar

## Step 2: Run Migrations (Copy & Paste)

### Migration 1: Core Schema
Copy the entire contents of `supabase/migrations/001_core_schema.sql` and paste into SQL Editor. Click **Run**.

### Migration 2: Submissions & Grades
Copy the entire contents of `supabase/migrations/002_submissions_grades.sql` and paste into SQL Editor. Click **Run**.

### Migration 3: Learning & Achievements
Copy the entire contents of `supabase/migrations/003_learning_achievements.sql` and paste into SQL Editor. Click **Run**.

### Migration 4: Notifications
Copy the entire contents of `supabase/migrations/004_notifications_messages.sql` and paste into SQL Editor. Click **Run**.

### Migration 5: Security Policies
Copy the entire contents of `supabase/migrations/005_rls_policies.sql` and paste into SQL Editor. Click **Run**.

### Migration 6: Triggers
Copy the entire contents of `supabase/migrations/006_triggers_functions.sql` and paste into SQL Editor. Click **Run**.

### Migration 7: Sample Data (Optional)
Copy the entire contents of `supabase/migrations/007_sample_data.sql` and paste into SQL Editor. Click **Run**.

## Step 3: Verify Setup

Run this query to check everything worked:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

You should see these tables:
- achievements
- assignments
- assignment_submissions
- goals
- grades
- learning_paths
- messages
- notifications
- notification_preferences
- parent_student_links
- parents
- plagiarism_reports
- push_subscriptions
- students
- study_sessions
- teachers
- user_profiles

## Step 4: Set Up Storage (Optional)

1. Go to **Storage** in Supabase Dashboard
2. Create bucket: `avatars` (public)
3. Create bucket: `assignment-files` (private)

## ✅ Done!

Your database is ready! Now you can:
- Sign up users through your app
- Create assignments
- Submit work
- Track progress
- Award achievements

See `SUPABASE_SETUP_COMPLETE.md` for detailed documentation.
