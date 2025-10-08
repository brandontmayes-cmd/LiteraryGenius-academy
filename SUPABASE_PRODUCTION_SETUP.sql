-- Run this in Supabase SQL Editor BEFORE deploying to production
-- This ensures all tables, policies, and functions are set up correctly

-- ============================================
-- VERIFY ALL TABLES EXIST
-- ============================================
-- Run this query to check if all tables are created:
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Expected tables:
-- - user_profiles
-- - parent_access_requests
-- - parent_student_links
-- - parent_notifications
-- (plus any other tables you've created)

-- ============================================
-- VERIFY RLS IS ENABLED
-- ============================================
-- Check that Row Level Security is enabled on all tables:
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- All tables should show rowsecurity = true

-- ============================================
-- VERIFY POLICIES EXIST
-- ============================================
-- Check that policies are created:
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================
-- PRODUCTION SECURITY SETTINGS
-- ============================================

-- Ensure email verification is required
-- Go to: Authentication → Settings → Email Auth
-- Enable: "Confirm email"

-- Set session timeout (recommended: 7 days)
-- Go to: Authentication → Settings
-- JWT expiry: 604800 (7 days in seconds)

-- ============================================
-- EDGE FUNCTIONS CHECK
-- ============================================
-- Verify edge functions are deployed:
-- Run in terminal:
-- supabase functions list

-- Expected functions:
-- - parent-portal-manager
-- - multi-subject-learning-path-generator
-- - teacher-analytics

-- ============================================
-- PRODUCTION URL CONFIGURATION
-- ============================================
-- After deployment, update in Supabase Dashboard:
-- 
-- 1. Authentication → URL Configuration:
--    - Site URL: https://your-production-domain.com
--    - Redirect URLs: https://your-production-domain.com/**
--
-- 2. Authentication → Email Templates:
--    - Update all templates to use production URL
--
-- 3. Authentication → Providers (if using OAuth):
--    - Configure Google/GitHub with production callback URLs

-- ============================================
-- VERIFY INDEXES FOR PERFORMANCE
-- ============================================
-- Check that indexes exist for frequently queried columns:
SELECT tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename;

-- ============================================
-- BACKUP REMINDER
-- ============================================
-- Before going live:
-- 1. Enable automatic backups in Supabase Dashboard
-- 2. Test restore process with sample data
-- 3. Document backup schedule

-- ============================================
-- MONITORING SETUP
-- ============================================
-- Enable in Supabase Dashboard:
-- 1. Database → Logs (monitor errors)
-- 2. Authentication → Logs (monitor auth issues)
-- 3. Edge Functions → Logs (monitor function calls)

-- ✅ Production setup complete!
-- Next: Deploy frontend to Vercel
