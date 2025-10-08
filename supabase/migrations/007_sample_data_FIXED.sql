-- Sample Data for Testing (FIXED VERSION - V2)
-- NOTE: This migration requires auth.users to exist first
-- Sample data should only be used in development/testing environments

-- IMPORTANT: The user_profiles table has a foreign key to auth.users
-- You must create auth users through Supabase Auth before inserting profiles
-- This script is designed to be run AFTER users are created via the app

-- For development: Create sample users first through Supabase Auth dashboard or API
-- Then update the UUIDs below to match your actual auth.users IDs

-- OPTION 1: Comment out all sample data (recommended for production)
-- OPTION 2: Update UUIDs below after creating auth users
-- OPTION 3: Run this only in development after manual user creation

-- Uncomment and update UUIDs after creating auth users:

/*
-- Sample user_profiles (must match existing auth.users IDs)
INSERT INTO user_profiles (id, email, full_name, role, avatar_url) VALUES
  ('YOUR-ACTUAL-UUID-HERE', 'teacher1@example.com', 'Ms. Sarah Johnson', 'teacher', NULL),
  ('YOUR-ACTUAL-UUID-HERE', 'teacher2@example.com', 'Mr. David Chen', 'teacher', NULL),
  ('YOUR-ACTUAL-UUID-HERE', 'student1@example.com', 'Emma Wilson', 'student', NULL),
  ('YOUR-ACTUAL-UUID-HERE', 'student2@example.com', 'James Martinez', 'student', NULL)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role;
*/

-- Migration complete - sample data commented out
-- To add sample data: Create auth users first, then uncomment and update UUIDs above
