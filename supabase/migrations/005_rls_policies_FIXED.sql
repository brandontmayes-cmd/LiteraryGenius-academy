-- Row Level Security Policies (FIXED - drops existing policies first)

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
  DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
  DROP POLICY IF EXISTS "Students can view own data" ON students;
  DROP POLICY IF EXISTS "Students can update own data" ON students;
  DROP POLICY IF EXISTS "Teachers can view students" ON students;
  DROP POLICY IF EXISTS "Teachers can manage assignments" ON assignments;
  DROP POLICY IF EXISTS "Students can view assignments" ON assignments;
  DROP POLICY IF EXISTS "Students manage own submissions" ON assignment_submissions;
  DROP POLICY IF EXISTS "Teachers view all submissions" ON assignment_submissions;
  DROP POLICY IF EXISTS "Students view own grades" ON grades;
  DROP POLICY IF EXISTS "Teachers manage grades" ON grades;
  DROP POLICY IF EXISTS "Users view own notifications" ON notifications;
  DROP POLICY IF EXISTS "Users update own notifications" ON notifications;
EXCEPTION
  WHEN undefined_table THEN NULL;
  WHEN undefined_object THEN NULL;
END $$;

-- Enable RLS on all tables (safe to run multiple times)
ALTER TABLE IF EXISTS user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS students ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS messages ENABLE ROW LEVEL SECURITY;

-- User Profiles: Users can view and update their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Students: Students can view their own data
CREATE POLICY "Students can view own data" ON students
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Students can update own data" ON students
  FOR UPDATE USING (user_id = auth.uid());

-- Teachers can view all students
CREATE POLICY "Teachers can view students" ON students
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'teacher'
    )
  );

-- Assignments: Teachers can manage, students can view assigned
CREATE POLICY "Teachers can manage assignments" ON assignments
  FOR ALL USING (teacher_id = auth.uid());

CREATE POLICY "Students can view assignments" ON assignments
  FOR SELECT USING (true);

-- Submissions: Students can manage own, teachers can view all
CREATE POLICY "Students manage own submissions" ON assignment_submissions
  FOR ALL USING (student_id = auth.uid());

CREATE POLICY "Teachers view all submissions" ON assignment_submissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'teacher'
    )
  );

-- Grades: Students view own, teachers manage
CREATE POLICY "Students view own grades" ON grades
  FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Teachers manage grades" ON grades
  FOR ALL USING (teacher_id = auth.uid());

-- Notifications: Users see own notifications
CREATE POLICY "Users view own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users update own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());
