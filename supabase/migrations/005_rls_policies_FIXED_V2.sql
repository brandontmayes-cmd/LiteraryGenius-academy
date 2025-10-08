-- Row Level Security Policies (FIXED V2 - corrects teacher_id references)

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

-- Enable RLS on all tables
ALTER TABLE IF EXISTS user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS students ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS notifications ENABLE ROW LEVEL SECURITY;

-- User Profiles
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Students
CREATE POLICY "Students can view own data" ON students
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Students can update own data" ON students
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Teachers can view students" ON students
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'teacher'
    )
  );

-- Assignments: Teachers manage via teachers table join
CREATE POLICY "Teachers can manage assignments" ON assignments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM teachers 
      WHERE teachers.id = assignments.teacher_id 
      AND teachers.user_id = auth.uid()
    )
  );

CREATE POLICY "Students can view assignments" ON assignments
  FOR SELECT USING (true);

-- Submissions
CREATE POLICY "Students manage own submissions" ON assignment_submissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM students 
      WHERE students.id = assignment_submissions.student_id 
      AND students.user_id = auth.uid()
    )
  );

CREATE POLICY "Teachers view all submissions" ON assignment_submissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'teacher'
    )
  );

-- Grades
CREATE POLICY "Students view own grades" ON grades
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM students 
      WHERE students.id = grades.student_id 
      AND students.user_id = auth.uid()
    )
  );

CREATE POLICY "Teachers manage grades" ON grades
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM teachers 
      WHERE teachers.id = grades.teacher_id 
      AND teachers.user_id = auth.uid()
    )
  );

-- Notifications
CREATE POLICY "Users view own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users update own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());
