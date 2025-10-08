-- Row Level Security Policies

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_student_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

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
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM teachers 
      WHERE user_id = auth.uid() AND id = teacher_id
    )
  );

CREATE POLICY "Students can view assignments" ON assignments
  FOR SELECT USING (true);

-- Submissions: Students can manage own, teachers can view all
CREATE POLICY "Students manage own submissions" ON assignment_submissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM students 
      WHERE user_id = auth.uid() AND id = student_id
    )
  );

CREATE POLICY "Teachers view all submissions" ON assignment_submissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'teacher'
    )
  );

-- Grades: Students view own, teachers manage
CREATE POLICY "Students view own grades" ON grades
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM students 
      WHERE user_id = auth.uid() AND id = student_id
    )
  );

CREATE POLICY "Teachers manage grades" ON grades
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM teachers 
      WHERE user_id = auth.uid() AND id = teacher_id
    )
  );

-- Notifications: Users see own notifications
CREATE POLICY "Users view own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users update own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());
