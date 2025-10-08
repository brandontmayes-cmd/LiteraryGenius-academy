-- Sample Data for Testing
-- Note: Run this AFTER creating test users through Supabase Auth

-- Sample Teachers (replace UUIDs with actual auth.users IDs)
INSERT INTO teachers (id, user_id, school, subjects, bio) VALUES
  ('11111111-1111-1111-1111-111111111111', 
   '00000000-0000-0000-0000-000000000001',
   'Lincoln High School',
   ARRAY['English', 'Literature'],
   'Passionate about fostering creative writing skills'),
  ('22222222-2222-2222-2222-222222222222',
   '00000000-0000-0000-0000-000000000002',
   'Washington Middle School',
   ARRAY['Math', 'Science'],
   'Making STEM fun and accessible')
ON CONFLICT (id) DO NOTHING;

-- Sample Students
INSERT INTO students (id, user_id, grade_level, school, total_xp, level, coins) VALUES
  ('33333333-3333-3333-3333-333333333333',
   '00000000-0000-0000-0000-000000000003',
   10, 'Lincoln High School', 2500, 3, 150),
  ('44444444-4444-4444-4444-444444444444',
   '00000000-0000-0000-0000-000000000004',
   9, 'Lincoln High School', 1800, 2, 90)
ON CONFLICT (id) DO NOTHING;

-- Sample Assignments
INSERT INTO assignments (teacher_id, title, description, type, subject, grade_level, due_date, total_points) VALUES
  ('11111111-1111-1111-1111-111111111111',
   'Essay: To Kill a Mockingbird Analysis',
   'Write a 5-paragraph essay analyzing themes in the novel',
   'essay', 'English', 10, NOW() + INTERVAL '7 days', 100),
  ('11111111-1111-1111-1111-111111111111',
   'Creative Writing: Short Story',
   'Write an original short story (1000-1500 words)',
   'project', 'Literature', 10, NOW() + INTERVAL '14 days', 150);

-- Sample Achievements
INSERT INTO achievements (student_id, title, description, badge_icon, xp_reward, category) VALUES
  ('33333333-3333-3333-3333-333333333333',
   'First Assignment Complete',
   'Submitted your first assignment',
   '🎯', 50, 'milestone'),
  ('33333333-3333-3333-3333-333333333333',
   'Perfect Score',
   'Earned 100% on an assignment',
   '⭐', 100, 'academic');

-- Sample Learning Paths
INSERT INTO learning_paths (student_id, title, description, subject, difficulty, progress) VALUES
  ('33333333-3333-3333-3333-333333333333',
   'Master Essay Writing',
   'Learn advanced essay techniques',
   'English', 'intermediate', 45);
