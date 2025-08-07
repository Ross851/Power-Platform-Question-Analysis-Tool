-- PL-600 Exam Prep Platform Database Schema
-- Version: 1.0.0
-- Description: Initial database schema for the platform

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- CORE TABLES
-- ============================================

-- Questions table (500+ exam questions)
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_number TEXT UNIQUE NOT NULL,
  question_text TEXT NOT NULL,
  question_type TEXT CHECK (question_type IN ('multiple-choice', 'hotspot', 'drag-drop', 'case-study')),
  options JSONB NOT NULL,
  correct_answer JSONB NOT NULL,
  explanation JSONB NOT NULL,
  exam_area TEXT CHECK (exam_area IN ('envisioning', 'architecture', 'implementation')),
  difficulty INTEGER CHECK (difficulty BETWEEN 1 AND 5),
  tags TEXT[] NOT NULL DEFAULT '{}',
  microsoft_learn_url TEXT,
  estimated_time INTEGER DEFAULT 60,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- User profiles (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  study_goal TEXT,
  target_exam_date DATE,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium', 'enterprise', 'admin')),
  subscription_expires_at TIMESTAMPTZ,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User progress tracking
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  attempt_number INTEGER NOT NULL DEFAULT 1,
  is_correct BOOLEAN NOT NULL,
  time_spent INTEGER,
  confidence_level INTEGER CHECK (confidence_level BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, question_id, attempt_number)
);

-- Study sessions
CREATE TABLE IF NOT EXISTS study_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_type TEXT CHECK (session_type IN ('practice', 'exam', 'focus', 'flashcard', 'lab')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  questions_attempted INTEGER DEFAULT 0,
  questions_correct INTEGER DEFAULT 0,
  total_time INTEGER,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Spaced repetition tracking
CREATE TABLE IF NOT EXISTS spaced_repetition (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  ease_factor DECIMAL DEFAULT 2.5,
  interval_days INTEGER DEFAULT 1,
  repetitions INTEGER DEFAULT 0,
  next_review_date DATE DEFAULT CURRENT_DATE + INTERVAL '1 day',
  last_reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, question_id)
);

-- ============================================
-- COMMUNITY FEATURES
-- ============================================

-- Question discussions
CREATE TABLE IF NOT EXISTS question_discussions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES question_discussions(id) ON DELETE CASCADE,
  upvotes INTEGER DEFAULT 0,
  is_expert_verified BOOLEAN DEFAULT false,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Discussion votes
CREATE TABLE IF NOT EXISTS discussion_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  discussion_id UUID REFERENCES question_discussions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_type TEXT CHECK (vote_type IN ('up', 'down')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(discussion_id, user_id)
);

-- User contributed questions
CREATE TABLE IF NOT EXISTS user_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submitted_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  question_data JSONB NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'needs_revision')),
  review_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

-- Study groups
CREATE TABLE IF NOT EXISTS study_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  max_members INTEGER DEFAULT 5,
  is_public BOOLEAN DEFAULT true,
  invite_code TEXT UNIQUE DEFAULT encode(gen_random_bytes(6), 'hex'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Study group members
CREATE TABLE IF NOT EXISTS study_group_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID REFERENCES study_groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'moderator', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- ============================================
-- LABS & MCP INTEGRATION
-- ============================================

-- Lab definitions
CREATE TABLE IF NOT EXISTS labs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lab_number TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  difficulty INTEGER CHECK (difficulty BETWEEN 1 AND 5),
  estimated_time INTEGER,
  mcp_server TEXT NOT NULL,
  instructions JSONB NOT NULL,
  validation_criteria JSONB,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Lab attempts
CREATE TABLE IF NOT EXISTS lab_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lab_id UUID REFERENCES labs(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  success BOOLEAN,
  score INTEGER CHECK (score BETWEEN 0 AND 100),
  feedback TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ANALYTICS & MONITORING
-- ============================================

-- Analytics events
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  resource TEXT,
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- GAMIFICATION
-- ============================================

-- Achievements
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  icon_url TEXT,
  criteria JSONB NOT NULL,
  points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User achievements
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Leaderboard
CREATE TABLE IF NOT EXISTS leaderboard (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  period TEXT CHECK (period IN ('daily', 'weekly', 'monthly', 'all-time')),
  score INTEGER DEFAULT 0,
  questions_answered INTEGER DEFAULT 0,
  accuracy_rate DECIMAL,
  study_streak INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, period)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Questions indexes
CREATE INDEX idx_questions_exam_area ON questions(exam_area);
CREATE INDEX idx_questions_difficulty ON questions(difficulty);
CREATE INDEX idx_questions_tags ON questions USING GIN(tags);
CREATE INDEX idx_questions_active ON questions(is_active) WHERE is_active = true;

-- User progress indexes
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_question_id ON user_progress(question_id);
CREATE INDEX idx_user_progress_created ON user_progress(created_at);

-- Study sessions indexes
CREATE INDEX idx_study_sessions_user_id ON study_sessions(user_id);
CREATE INDEX idx_study_sessions_type ON study_sessions(session_type);
CREATE INDEX idx_study_sessions_started ON study_sessions(started_at);

-- Spaced repetition indexes
CREATE INDEX idx_spaced_repetition_user_next ON spaced_repetition(user_id, next_review_date);
CREATE INDEX idx_spaced_repetition_review_date ON spaced_repetition(next_review_date);

-- Discussion indexes
CREATE INDEX idx_discussions_question ON question_discussions(question_id);
CREATE INDEX idx_discussions_user ON question_discussions(user_id);
CREATE INDEX idx_discussions_parent ON question_discussions(parent_id);

-- Analytics indexes
CREATE INDEX idx_analytics_user_event ON analytics_events(user_id, event_type);
CREATE INDEX idx_analytics_created ON analytics_events(created_at);

-- Audit log indexes
CREATE INDEX idx_audit_user_action ON audit_logs(user_id, action);
CREATE INDEX idx_audit_created ON audit_logs(created_at);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE spaced_repetition ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussion_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- User progress policies
CREATE POLICY "Users can manage own progress" ON user_progress
  FOR ALL USING (auth.uid() = user_id);

-- Study sessions policies
CREATE POLICY "Users can manage own sessions" ON study_sessions
  FOR ALL USING (auth.uid() = user_id);

-- Spaced repetition policies
CREATE POLICY "Users can manage own repetition" ON spaced_repetition
  FOR ALL USING (auth.uid() = user_id);

-- Questions are public read
CREATE POLICY "Questions are public" ON questions
  FOR SELECT USING (is_active = true);

-- Discussions policies
CREATE POLICY "Discussions are public read" ON question_discussions
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can post" ON question_discussions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can edit own discussions" ON question_discussions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own discussions" ON question_discussions
  FOR DELETE USING (auth.uid() = user_id);

-- Labs are public read
CREATE POLICY "Labs are public" ON labs
  FOR SELECT USING (is_active = true);

-- Lab attempts policies
CREATE POLICY "Users can manage own lab attempts" ON lab_attempts
  FOR ALL USING (auth.uid() = user_id);

-- Analytics policies
CREATE POLICY "Users can write own analytics" ON analytics_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Achievements are public read
CREATE POLICY "Achievements are public" ON achievements
  FOR SELECT USING (true);

-- User achievements policies
CREATE POLICY "Users can view own achievements" ON user_achievements
  FOR SELECT USING (auth.uid() = user_id);

-- Leaderboard is public read
CREATE POLICY "Leaderboard is public" ON leaderboard
  FOR SELECT USING (true);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add update triggers
CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON questions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_spaced_repetition_updated_at BEFORE UPDATE ON spaced_repetition
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Calculate user statistics
CREATE OR REPLACE FUNCTION calculate_user_stats(p_user_id UUID)
RETURNS TABLE (
  total_questions INTEGER,
  questions_attempted INTEGER,
  questions_correct INTEGER,
  accuracy_rate DECIMAL,
  avg_time_spent INTEGER,
  study_streak INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*)::INTEGER FROM questions WHERE is_active = true),
    COUNT(DISTINCT up.question_id)::INTEGER,
    SUM(CASE WHEN up.is_correct THEN 1 ELSE 0 END)::INTEGER,
    CASE 
      WHEN COUNT(*) > 0 THEN 
        ROUND(SUM(CASE WHEN up.is_correct THEN 1 ELSE 0 END)::DECIMAL / COUNT(*)::DECIMAL * 100, 2)
      ELSE 0
    END,
    AVG(up.time_spent)::INTEGER,
    COALESCE((
      SELECT COUNT(*)::INTEGER 
      FROM generate_series(
        CURRENT_DATE - INTERVAL '30 days',
        CURRENT_DATE,
        '1 day'::INTERVAL
      ) AS date
      WHERE EXISTS (
        SELECT 1 FROM study_sessions ss
        WHERE ss.user_id = p_user_id
        AND DATE(ss.started_at) = date::DATE
      )
    ), 0)
  FROM user_progress up
  WHERE up.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SEED DATA (Optional)
-- ============================================

-- Insert default achievements
INSERT INTO achievements (name, description, icon_url, criteria, points) VALUES
  ('First Steps', 'Answer your first question', '🎯', '{"questions_answered": 1}', 10),
  ('Dedicated Learner', 'Maintain a 7-day study streak', '🔥', '{"study_streak": 7}', 50),
  ('Perfect Score', 'Get 10 questions correct in a row', '⭐', '{"consecutive_correct": 10}', 100),
  ('Speed Demon', 'Answer 50 questions in one session', '⚡', '{"session_questions": 50}', 75),
  ('Lab Master', 'Complete 5 hands-on labs', '🔬', '{"labs_completed": 5}', 150)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON TABLE questions IS 'Core exam questions table containing all PL-600 questions';
COMMENT ON TABLE user_profiles IS 'Extended user profiles linked to Supabase auth';
COMMENT ON TABLE user_progress IS 'Tracks individual question attempts and performance';
COMMENT ON TABLE study_sessions IS 'Records study session metadata and statistics';
COMMENT ON TABLE spaced_repetition IS 'Implements SM-2 algorithm for optimal review scheduling';
COMMENT ON TABLE labs IS 'Hands-on lab definitions for practical exercises';
COMMENT ON TABLE achievements IS 'Gamification achievements to motivate users';

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;