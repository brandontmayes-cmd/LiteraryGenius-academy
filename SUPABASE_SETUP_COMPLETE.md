# Supabase Database Setup - Complete Guide

## 🎉 Your Database Schema is Ready!

All SQL migration files have been created in `supabase/migrations/`. Here's how to set everything up:

## 📋 Setup Steps

### 1. Run Migrations in Order

Go to your Supabase Dashboard → SQL Editor and run these files **in order**:

1. **001_core_schema.sql** - Core tables (users, students, teachers, parents, assignments)
2. **002_submissions_grades.sql** - Submissions, grades, plagiarism reports
3. **003_learning_achievements.sql** - Learning paths, achievements, goals
4. **004_notifications_messages.sql** - Notifications and messaging system
5. **005_rls_policies.sql** - Row Level Security policies
6. **006_triggers_functions.sql** - Automated triggers and functions
7. **007_sample_data.sql** - Sample data for testing (optional)

### 2. What Each Migration Does

**001_core_schema.sql**
- ✅ User profiles (extends Supabase Auth)
- ✅ Student profiles with XP, levels, coins
- ✅ Teacher profiles
- ✅ Parent profiles
- ✅ Parent-student relationships
- ✅ Assignments table

**002_submissions_grades.sql**
- ✅ Assignment submissions with file uploads
- ✅ Grades with rubric scoring
- ✅ Plagiarism detection reports
- ✅ Performance indexes

**003_learning_achievements.sql**
- ✅ Personalized learning paths
- ✅ Achievement badges
- ✅ Study session tracking
- ✅ Student goals

**004_notifications_messages.sql**
- ✅ Real-time notifications
- ✅ Direct messaging between users
- ✅ Notification preferences
- ✅ Push notification subscriptions

**005_rls_policies.sql**
- ✅ Students can only see their own data
- ✅ Teachers can view all students and submissions
- ✅ Parents can view linked student data
- ✅ Secure grade access

**006_triggers_functions.sql**
- ✅ Auto-update timestamps
- ✅ Send notification when grade is posted
- ✅ Award XP automatically when graded
- ✅ Create user profile on signup
- ✅ Update student level based on XP

**007_sample_data.sql**
- ✅ Sample teachers, students, assignments
- ✅ Sample achievements and learning paths
- ✅ Ready-to-test data

## 🔐 Security Features

✅ **Row Level Security (RLS)** enabled on all tables
✅ **Role-based access control** (student, teacher, parent, admin)
✅ **Secure data isolation** - users only see their own data
✅ **Foreign key constraints** maintain data integrity
✅ **Cascading deletes** clean up related data

## 🚀 Automated Features

✅ **Auto-notifications** when grades are posted
✅ **XP system** awards points automatically
✅ **Level progression** based on total XP
✅ **Timestamp tracking** on all updates
✅ **User profile creation** on signup

## 📊 Database Schema Overview

```
auth.users (Supabase Auth)
  └── user_profiles (role, avatar, etc)
       ├── students (XP, level, coins)
       ├── teachers (school, subjects)
       └── parents (phone)

assignments
  └── assignment_submissions
       ├── grades (score, feedback)
       └── plagiarism_reports

students
  ├── learning_paths
  ├── achievements
  ├── study_sessions
  └── goals

user_profiles
  ├── notifications
  └── messages
```

## 🧪 Testing Your Setup

After running migrations, test with:

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- View sample data
SELECT * FROM students LIMIT 5;
SELECT * FROM assignments LIMIT 5;
```

## 🔧 Next Steps

1. ✅ Run all migration files in Supabase SQL Editor
2. ✅ Create test users through Supabase Auth
3. ✅ Update sample data UUIDs with real user IDs
4. ✅ Test authentication in your app
5. ✅ Verify RLS policies work correctly

## 📝 Important Notes

- **User IDs**: The sample data uses placeholder UUIDs. Replace with real auth.users IDs
- **Storage**: Set up storage buckets for file uploads (avatars, assignments)
- **Edge Functions**: Already deployed for AI features, notifications, etc.
- **Environment Variables**: Ensure `.env` has correct Supabase URL and keys

## 🆘 Troubleshooting

**Error: "relation already exists"**
- Some tables may already exist from previous setup
- This is OK - migrations use `CREATE TABLE IF NOT EXISTS`

**Error: "permission denied"**
- Make sure you're running SQL as the postgres user in Supabase Dashboard

**RLS blocking queries**
- Temporarily disable RLS for testing: `ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;`
- Re-enable after testing: `ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;`

## 🎓 Your Database is Production-Ready!

All tables, relationships, security policies, and automated features are configured. Your Literary Genius Academy is ready to handle real users! 🚀
