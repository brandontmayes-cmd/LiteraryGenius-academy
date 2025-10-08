-- Study Sessions Table
CREATE TABLE IF NOT EXISTS study_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  subject VARCHAR(100) NOT NULL,
  scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  assignment_id UUID REFERENCES assignments(id) ON DELETE SET NULL,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for study_sessions
CREATE POLICY "Students can view their own study sessions"
  ON study_sessions FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Students can insert their own study sessions"
  ON study_sessions FOR INSERT
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update their own study sessions"
  ON study_sessions FOR UPDATE
  USING (auth.uid() = student_id);

CREATE POLICY "Students can delete their own study sessions"
  ON study_sessions FOR DELETE
  USING (auth.uid() = student_id);

-- Teachers can view study sessions for their students
CREATE POLICY "Teachers can view study sessions"
  ON study_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.user_id = auth.uid() 
      AND user_profiles.role = 'teacher'
    )
  );

-- Indexes for performance
CREATE INDEX idx_study_sessions_student_id ON study_sessions(student_id);
CREATE INDEX idx_study_sessions_scheduled_date ON study_sessions(scheduled_date);
CREATE INDEX idx_study_sessions_assignment_id ON study_sessions(assignment_id);


-- Add teacher-specific columns to existing tables
ALTER TABLE students ADD COLUMN IF NOT EXISTS teacher_id UUID REFERENCES auth.users(id);
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS teacher_id UUID REFERENCES auth.users(id);

-- Create teachers table for teacher profiles
CREATE TABLE IF NOT EXISTS teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  class_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create class_enrollments table for student-teacher relationships
CREATE TABLE IF NOT EXISTS class_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id),
  teacher_id UUID REFERENCES teachers(id),
  subject TEXT,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, teacher_id, subject)
);

-- Create assignment_submissions table
CREATE TABLE IF NOT EXISTS assignment_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID REFERENCES assignments(id),
  student_id UUID REFERENCES students(id),
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  content TEXT,
  status TEXT DEFAULT 'submitted',
  teacher_feedback TEXT,
  graded_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on new tables
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for teachers
CREATE POLICY "Teachers can view their own profile" ON teachers
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Teachers can update their own profile" ON teachers
  FOR UPDATE USING (user_id = auth.uid());

-- RLS Policies for class enrollments
CREATE POLICY "Teachers can view their class enrollments" ON class_enrollments
  FOR SELECT USING (teacher_id IN (SELECT id FROM teachers WHERE user_id = auth.uid()));

-- RLS Policies for assignment submissions
CREATE POLICY "Teachers can view submissions for their assignments" ON assignment_submissions
  FOR ALL USING (assignment_id IN (SELECT id FROM assignments WHERE teacher_id = auth.uid()));

-- Sample teacher data
INSERT INTO teachers (user_id, name, email, subject, class_name) VALUES
  (gen_random_uuid(), 'Ms. Sarah Johnson', 'sarah.johnson@lga.edu', 'Mathematics', '5th Grade Math'),
  (gen_random_uuid(), 'Mr. David Chen', 'david.chen@lga.edu', 'English', '5th Grade English'),
  (gen_random_uuid(), 'Mrs. Emily Rodriguez', 'emily.rodriguez@lga.edu', 'Science', '5th Grade Science')
ON CONFLICT (user_id) DO NOTHING;

-- Parent-Student relationships table
CREATE TABLE IF NOT EXISTS parent_students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  relationship_type TEXT DEFAULT 'parent',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(parent_id, student_id)
);

-- Messages table for parent-teacher communication
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  message_type TEXT DEFAULT 'general',
  priority TEXT DEFAULT 'normal',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Progress reports table
CREATE TABLE IF NOT EXISTS progress_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  report_period TEXT NOT NULL,
  overall_grade DECIMAL(5,2),
  attendance_rate DECIMAL(5,2),
  behavior_score INTEGER,
  teacher_comments TEXT,
  parent_comments TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE parent_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for parent_students
CREATE POLICY "Parents can view their student relationships" ON parent_students
  FOR SELECT USING (parent_id = auth.uid());

-- RLS Policies for messages
CREATE POLICY "Users can view their own messages" ON messages
  FOR SELECT USING (sender_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());

-- RLS Policies for progress reports
CREATE POLICY "Parents can view their children's progress reports" ON progress_reports
  FOR SELECT USING (
    student_id IN (
      SELECT student_id FROM parent_students WHERE parent_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can manage progress reports" ON progress_reports
  FOR ALL USING (teacher_id = auth.uid());

-- Indexes for performance
CREATE INDEX idx_parent_students_parent_id ON parent_students(parent_id);
CREATE INDEX idx_parent_students_student_id ON parent_students(student_id);
CREATE INDEX idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX idx_messages_student_id ON messages(student_id);
CREATE INDEX idx_progress_reports_student_id ON progress_reports(student_id);

-- Multi-Subject Learning Paths System
CREATE TABLE IF NOT EXISTS subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  grade_levels INTEGER[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert core subjects
INSERT INTO subjects (name, code, description, grade_levels) VALUES
  ('English Language Arts', 'ELA', 'Reading, writing, speaking, and listening skills', '{0,1,2,3,4,5,6,7,8,9,10,11,12}'),
  ('Mathematics', 'MATH', 'Number sense, algebra, geometry, and data analysis', '{0,1,2,3,4,5,6,7,8,9,10,11,12}'),
  ('Science', 'SCI', 'Physical, life, earth, and space sciences', '{0,1,2,3,4,5,6,7,8,9,10,11,12}'),
  ('Social Studies', 'SS', 'History, geography, civics, and economics', '{0,1,2,3,4,5,6,7,8,9,10,11,12}')
ON CONFLICT (code) DO NOTHING;

-- Learning paths table
CREATE TABLE IF NOT EXISTS learning_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5),
  estimated_duration_hours INTEGER DEFAULT 10,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  ai_generated BOOLEAN DEFAULT TRUE,
  cross_curricular_connections TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Learning activities table with subject-specific types
CREATE TABLE IF NOT EXISTS learning_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  learning_path_id UUID REFERENCES learning_paths(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  activity_type TEXT NOT NULL,
  subject_specific_type TEXT,
  difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5),
  estimated_minutes INTEGER DEFAULT 30,
  sequence_order INTEGER NOT NULL,
  prerequisites TEXT[] DEFAULT '{}',
  standards_addressed TEXT[] DEFAULT '{}',
  cross_curricular_tags TEXT[] DEFAULT '{}',
  content_url TEXT,
  instructions TEXT,
  success_criteria TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Student activity progress tracking
CREATE TABLE IF NOT EXISTS student_activity_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  activity_id UUID REFERENCES learning_activities(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'needs_review')),
  score DECIMAL(5,2),
  time_spent_minutes INTEGER DEFAULT 0,
  attempts INTEGER DEFAULT 0,
  feedback TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, activity_id)
);

-- Cross-curricular connections table
CREATE TABLE IF NOT EXISTS cross_curricular_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  primary_subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  connected_subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  connection_type TEXT NOT NULL,
  description TEXT,
  strength INTEGER DEFAULT 1 CHECK (strength BETWEEN 1 AND 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(primary_subject_id, connected_subject_id, connection_type)
);

-- Standards prerequisites for adaptive sequencing
CREATE TABLE IF NOT EXISTS standards_prerequisites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  standard_id TEXT NOT NULL,
  prerequisite_standard_id TEXT NOT NULL,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  strength INTEGER DEFAULT 1 CHECK (strength BETWEEN 1 AND 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(standard_id, prerequisite_standard_id)
);

-- Performance analytics for adaptive difficulty
CREATE TABLE IF NOT EXISTS student_performance_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  metric_name TEXT NOT NULL,
  metric_value DECIMAL(10,4),
  time_period TEXT DEFAULT 'week',
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, subject_id, metric_name, time_period, calculated_at)
);

-- Enable RLS on new tables
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_activity_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE cross_curricular_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE standards_prerequisites ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_performance_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Everyone can view subjects" ON subjects FOR SELECT USING (true);
CREATE POLICY "Students can view their learning paths" ON learning_paths FOR SELECT USING (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()));
CREATE POLICY "Teachers can view learning paths for their students" ON learning_paths FOR SELECT USING (
  student_id IN (
    SELECT s.id FROM students s 
    JOIN class_enrollments ce ON s.id = ce.student_id 
    JOIN teachers t ON ce.teacher_id = t.id 
    WHERE t.user_id = auth.uid()
  )
);

-- Indexes for performance
CREATE INDEX idx_learning_paths_student_subject ON learning_paths(student_id, subject_id);
CREATE INDEX idx_learning_activities_path_sequence ON learning_activities(learning_path_id, sequence_order);
CREATE INDEX idx_student_activity_progress_student ON student_activity_progress(student_id);
CREATE INDEX idx_standards_prerequisites_standard ON standards_prerequisites(standard_id);
CREATE INDEX idx_performance_analytics_student_subject ON student_performance_analytics(student_id, subject_id);