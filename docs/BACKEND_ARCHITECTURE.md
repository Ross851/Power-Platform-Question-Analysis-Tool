# Backend Architecture - Supabase Implementation

## Overview

The PL-600 Exam Prep Platform uses Supabase as the backend-as-a-service (BaaS) solution, providing database, authentication, real-time subscriptions, and storage capabilities.

## Why Supabase?

### Advantages
- **Open Source**: Based on PostgreSQL, avoid vendor lock-in
- **Generous Free Tier**: Perfect for MVP and early growth
- **Real-time**: WebSocket subscriptions for live features
- **Built-in Auth**: OAuth with Microsoft, GitHub, Google
- **Row Level Security**: Secure multi-tenant data access
- **Edge Functions**: Serverless compute for business logic
- **Storage**: For PDFs, images, and user uploads

### Free Tier Limits (Sufficient for MVP)
- 500MB Database
- 1GB File Storage  
- 50,000 Monthly Active Users
- 2GB Bandwidth
- Unlimited API requests

## Database Schema

### Core Tables

```sql
-- Questions table (500+ questions)
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_number TEXT UNIQUE NOT NULL, -- e.g., "PL600-001"
  question_text TEXT NOT NULL,
  question_type TEXT CHECK (question_type IN ('multiple-choice', 'hotspot', 'drag-drop', 'case-study')),
  options JSONB NOT NULL, -- Array of {id, text, isCorrect}
  correct_answer JSONB NOT NULL, -- Single or array of answers
  explanation JSONB NOT NULL, -- {correct: "", incorrect: {}}
  exam_area TEXT CHECK (exam_area IN ('envisioning', 'architecture', 'implementation')),
  difficulty INTEGER CHECK (difficulty BETWEEN 1 AND 5),
  tags TEXT[] NOT NULL,
  microsoft_learn_url TEXT,
  estimated_time INTEGER, -- seconds
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Users table (extends Supabase auth.users)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  display_name TEXT,
  avatar_url TEXT,
  study_goal TEXT,
  target_exam_date DATE,
  subscription_tier TEXT DEFAULT 'free',
  subscription_expires_at TIMESTAMPTZ,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User progress tracking
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id UUID REFERENCES questions(id),
  attempt_number INTEGER NOT NULL,
  is_correct BOOLEAN NOT NULL,
  time_spent INTEGER, -- seconds
  confidence_level INTEGER CHECK (confidence_level BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, question_id, attempt_number)
);

-- Study sessions
CREATE TABLE study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_type TEXT CHECK (session_type IN ('practice', 'exam', 'focus', 'flashcard')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  questions_attempted INTEGER DEFAULT 0,
  questions_correct INTEGER DEFAULT 0,
  total_time INTEGER, -- seconds
  metadata JSONB DEFAULT '{}'
);

-- Spaced repetition tracking
CREATE TABLE spaced_repetition (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id UUID REFERENCES questions(id),
  ease_factor DECIMAL DEFAULT 2.5,
  interval_days INTEGER DEFAULT 1,
  repetitions INTEGER DEFAULT 0,
  next_review_date DATE DEFAULT CURRENT_DATE + INTERVAL '1 day',
  last_reviewed_at TIMESTAMPTZ,
  UNIQUE(user_id, question_id)
);

-- Community features
CREATE TABLE question_discussions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID REFERENCES questions(id),
  user_id UUID REFERENCES auth.users(id),
  content TEXT NOT NULL,
  parent_id UUID REFERENCES question_discussions(id),
  upvotes INTEGER DEFAULT 0,
  is_expert_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User contributed questions
CREATE TABLE user_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submitted_by UUID REFERENCES auth.users(id),
  question_data JSONB NOT NULL,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')),
  review_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

-- Analytics events
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Labs and MCP integration tracking
CREATE TABLE lab_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lab_id TEXT NOT NULL,
  mcp_server TEXT NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  success BOOLEAN,
  score INTEGER CHECK (score BETWEEN 0 AND 100),
  metadata JSONB DEFAULT '{}'
);
```

### Indexes for Performance

```sql
-- Performance indexes
CREATE INDEX idx_questions_exam_area ON questions(exam_area);
CREATE INDEX idx_questions_difficulty ON questions(difficulty);
CREATE INDEX idx_questions_tags ON questions USING GIN(tags);
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_question_id ON user_progress(question_id);
CREATE INDEX idx_study_sessions_user_id ON study_sessions(user_id);
CREATE INDEX idx_spaced_repetition_next_review ON spaced_repetition(user_id, next_review_date);
CREATE INDEX idx_discussions_question_id ON question_discussions(question_id);
CREATE INDEX idx_analytics_user_event ON analytics_events(user_id, event_type);
```

## Row Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE spaced_repetition ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_attempts ENABLE ROW LEVEL SECURITY;

-- User can only see/edit their own data
CREATE POLICY "Users can view own profile" 
  ON user_profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON user_profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can view own progress" 
  ON user_progress FOR ALL 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own sessions" 
  ON study_sessions FOR ALL 
  USING (auth.uid() = user_id);

-- Questions are public read
CREATE POLICY "Questions are viewable by all" 
  ON questions FOR SELECT 
  USING (true);

-- Discussions are public read, authenticated write
CREATE POLICY "Anyone can read discussions" 
  ON question_discussions FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can create discussions" 
  ON question_discussions FOR INSERT 
  USING (auth.uid() IS NOT NULL);
```

## Supabase Edge Functions

### Question Extraction Function

```typescript
// supabase/functions/extract-questions/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import pdfParse from 'https://esm.sh/pdf-parse@1.1.1'

serve(async (req) => {
  const { pdfUrl } = await req.json()
  
  // Parse PDF
  const pdfData = await fetch(pdfUrl)
  const buffer = await pdfData.arrayBuffer()
  const parsed = await pdfParse(buffer)
  
  // Extract questions using pattern matching
  const questions = extractQuestionsFromText(parsed.text)
  
  // Insert into database
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )
  
  const { data, error } = await supabase
    .from('questions')
    .insert(questions)
  
  return new Response(
    JSON.stringify({ success: !error, count: questions.length }),
    { headers: { 'Content-Type': 'application/json' } }
  )
})
```

### Spaced Repetition Calculator

```typescript
// supabase/functions/calculate-next-review/index.ts
serve(async (req) => {
  const { userId, questionId, performance } = await req.json()
  
  // Get current spaced repetition data
  const { data: current } = await supabase
    .from('spaced_repetition')
    .select('*')
    .eq('user_id', userId)
    .eq('question_id', questionId)
    .single()
  
  // Calculate next review using SM-2 algorithm
  const { easeFactor, interval, repetitions } = calculateSM2(
    current?.ease_factor || 2.5,
    current?.interval_days || 1,
    current?.repetitions || 0,
    performance
  )
  
  // Update database
  const { error } = await supabase
    .from('spaced_repetition')
    .upsert({
      user_id: userId,
      question_id: questionId,
      ease_factor: easeFactor,
      interval_days: interval,
      repetitions,
      next_review_date: new Date(Date.now() + interval * 86400000),
      last_reviewed_at: new Date()
    })
  
  return new Response(
    JSON.stringify({ 
      nextReview: interval,
      easeFactor,
      repetitions 
    }),
    { headers: { 'Content-Type': 'application/json' } }
  )
})
```

## API Integration in React

### Supabase Client Setup

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
})

// Type definitions
export type Question = Database['public']['Tables']['questions']['Row']
export type UserProgress = Database['public']['Tables']['user_progress']['Row']
export type StudySession = Database['public']['Tables']['study_sessions']['Row']
```

### React Query Integration

```typescript
// src/hooks/useQuestions.ts
import { useQuery, useMutation } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useQuestions(filters?: QuestionFilters) {
  return useQuery({
    queryKey: ['questions', filters],
    queryFn: async () => {
      let query = supabase.from('questions').select('*')
      
      if (filters?.examArea) {
        query = query.eq('exam_area', filters.examArea)
      }
      if (filters?.difficulty) {
        query = query.eq('difficulty', filters.difficulty)
      }
      if (filters?.tags) {
        query = query.contains('tags', filters.tags)
      }
      
      const { data, error } = await query
      if (error) throw error
      return data
    }
  })
}

export function useSubmitAnswer() {
  return useMutation({
    mutationFn: async ({ questionId, answer, timeSpent }) => {
      const { data: { user } } = await supabase.auth.getUser()
      
      const { error } = await supabase
        .from('user_progress')
        .insert({
          user_id: user.id,
          question_id: questionId,
          is_correct: answer.isCorrect,
          time_spent: timeSpent
        })
      
      if (error) throw error
    }
  })
}
```

### Real-time Subscriptions

```typescript
// src/hooks/useRealtimeProgress.ts
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export function useRealtimeProgress(userId: string) {
  const [progress, setProgress] = useState<UserProgress[]>([])
  
  useEffect(() => {
    const subscription = supabase
      .channel('user-progress')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_progress',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          setProgress(prev => [...prev, payload.new as UserProgress])
        }
      )
      .subscribe()
    
    return () => {
      subscription.unsubscribe()
    }
  }, [userId])
  
  return progress
}
```

## Authentication Flow

```typescript
// src/contexts/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    // Check active sessions
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )
    
    return () => subscription.unsubscribe()
  }, [])
  
  const signInWithMicrosoft = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'azure',
      options: {
        scopes: 'email profile',
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    if (error) throw error
  }
  
  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }
  
  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      signInWithMicrosoft, 
      signOut 
    }}>
      {children}
    </AuthContext.Provider>
  )
}
```

## Deployment Configuration

### Environment Variables

```bash
# .env.local
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-key # Never expose in client!
```

### Supabase CLI Setup

```bash
# Install Supabase CLI
npm install -g supabase

# Initialize project
supabase init

# Link to remote project
supabase link --project-ref your-project-ref

# Push database schema
supabase db push

# Deploy Edge Functions
supabase functions deploy extract-questions
supabase functions deploy calculate-next-review
```

## Cost Optimization

### Free Tier Management
1. **Database**: Monitor size, use JSONB for flexible data
2. **Storage**: Compress PDFs, use CDN for static files
3. **Functions**: Batch operations to reduce invocations
4. **Bandwidth**: Cache aggressively on client

### When to Scale
- **Database > 400MB**: Consider archiving old sessions
- **MAU > 40K**: Prepare for Pro tier ($25/month)
- **Storage > 800MB**: Move PDFs to external CDN
- **Functions > 500K/month**: Optimize or move to dedicated backend

## Security Best Practices

1. **Never expose service role key** in client code
2. **Use RLS policies** for all tables
3. **Validate input** in Edge Functions
4. **Rate limit** API calls
5. **Audit logs** for sensitive operations
6. **Encrypt PII** at rest

## Monitoring & Analytics

```sql
-- Dashboard queries
-- Daily active users
SELECT COUNT(DISTINCT user_id) as dau
FROM analytics_events
WHERE created_at > NOW() - INTERVAL '1 day';

-- Most missed questions
SELECT q.question_number, q.question_text, 
       COUNT(*) as attempts,
       SUM(CASE WHEN up.is_correct THEN 1 ELSE 0 END)::float / COUNT(*) as success_rate
FROM user_progress up
JOIN questions q ON q.id = up.question_id
GROUP BY q.id
ORDER BY success_rate ASC
LIMIT 20;

-- User progress over time
SELECT DATE(created_at) as date,
       AVG(CASE WHEN is_correct THEN 1 ELSE 0 END) as accuracy
FROM user_progress
WHERE user_id = $1
GROUP BY DATE(created_at)
ORDER BY date;
```

## Backup & Recovery

```bash
# Automated daily backups (Pro tier)
# Manual backup for free tier
supabase db dump > backup-$(date +%Y%m%d).sql

# Restore from backup
psql $DATABASE_URL < backup-20240101.sql
```

---

This backend architecture provides a robust, scalable foundation for the PL-600 Exam Prep Platform while staying within free tier limits during MVP phase.