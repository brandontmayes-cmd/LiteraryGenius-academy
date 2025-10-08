-- Triggers and Functions for Automated Actions (FIXED VERSION)

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables with updated_at (DROP IF EXISTS to prevent errors)
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_submissions_updated_at ON assignment_submissions;
CREATE TRIGGER update_submissions_updated_at
  BEFORE UPDATE ON assignment_submissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function: Create notification when grade is posted
CREATE OR REPLACE FUNCTION notify_grade_posted()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (user_id, title, message, type, action_url)
  SELECT s.user_id, 
         'New Grade Posted',
         'Your assignment has been graded',
         'grade',
         '/grades/' || NEW.id
  FROM students s
  WHERE s.id = NEW.student_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS grade_posted_notification ON grades;
CREATE TRIGGER grade_posted_notification
  AFTER INSERT ON grades
  FOR EACH ROW EXECUTE FUNCTION notify_grade_posted();

-- Function: Award XP when assignment is graded
CREATE OR REPLACE FUNCTION award_xp_on_grade()
RETURNS TRIGGER AS $$
DECLARE
  xp_amount INTEGER;
BEGIN
  xp_amount := FLOOR((NEW.score / NEW.max_score) * 100);
  
  UPDATE students 
  SET total_xp = total_xp + xp_amount,
      level = FLOOR((total_xp + xp_amount) / 1000) + 1
  WHERE id = NEW.student_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS award_xp_trigger ON grades;
CREATE TRIGGER award_xp_trigger
  AFTER INSERT ON grades
  FOR EACH ROW EXECUTE FUNCTION award_xp_on_grade();

-- Function: Create user profile after signup
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, email, role)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'role', 'student'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- DROP IF EXISTS to prevent "already exists" error
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_user_profile();
