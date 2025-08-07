# Deployment Guide for PL-600 Exam Prep Platform

## Overview
This application is configured for deployment to GitHub Pages with Supabase backend.

## Prerequisites
- GitHub repository with GitHub Pages enabled
- Supabase project with authentication and database configured
- Node.js 20+ and npm installed locally

## Deployment Methods

### Method 1: Automatic GitHub Actions Deployment (Recommended)

1. **Set up GitHub Secrets:**
   Go to your repository Settings > Secrets and variables > Actions, and add:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key

2. **Enable GitHub Pages:**
   - Go to Settings > Pages
   - Source: Deploy from a branch
   - Branch: gh-pages (will be created automatically)

3. **Push to main branch:**
   ```bash
   git add .
   git commit -m "Deploy to GitHub Pages"
   git push origin main
   ```

   The GitHub Action will automatically:
   - Build the project
   - Deploy to GitHub Pages
   - Available at: `https://[username].github.io/pl600-prep/`

### Method 2: Manual Deployment

1. **Install gh-pages package:**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Build for GitHub Pages:**
   ```bash
   npm run build:gh-pages
   ```

3. **Deploy:**
   ```bash
   npm run deploy
   ```

## Supabase Setup

### 1. Create Tables

Run these SQL commands in your Supabase SQL editor:

```sql
-- Questions table
CREATE TABLE questions (
  id TEXT PRIMARY KEY,
  question_number TEXT,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL,
  options JSONB,
  correct_answer TEXT,
  correct_order TEXT[],
  correct_spots TEXT[],
  hotspots JSONB,
  items TEXT[],
  image_url TEXT,
  max_selections INTEGER,
  explanation JSONB,
  difficulty TEXT,
  exam_area TEXT,
  topic TEXT,
  tags TEXT[],
  time_limit INTEGER DEFAULT 60,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User progress table
CREATE TABLE user_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id TEXT REFERENCES questions(id),
  is_correct BOOLEAN NOT NULL,
  time_spent INTEGER,
  attempt_number INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_questions_type ON questions(question_type);
CREATE INDEX idx_questions_area ON questions(exam_area);
CREATE INDEX idx_questions_difficulty ON questions(difficulty);
CREATE INDEX idx_questions_active ON questions(is_active);
CREATE INDEX idx_progress_user ON user_progress(user_id);
CREATE INDEX idx_progress_question ON user_progress(question_id);
CREATE INDEX idx_progress_created ON user_progress(created_at);
```

### 2. Enable Row Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Questions are readable by all, writable by none (admin only)
CREATE POLICY "Questions are viewable by everyone" 
  ON questions FOR SELECT 
  USING (true);

-- Users can only see and modify their own progress
CREATE POLICY "Users can view own progress" 
  ON user_progress FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" 
  ON user_progress FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" 
  ON user_progress FOR UPDATE 
  USING (auth.uid() = user_id);
```

### 3. Upload Questions

```bash
# Set environment variables
export VITE_SUPABASE_URL="your-supabase-url"
export VITE_SUPABASE_ANON_KEY="your-anon-key"

# Run upload script
npm run upload-questions
```

## Environment Variables

Create a `.env.local` file for local development:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Post-Deployment Checklist

- [ ] Verify GitHub Pages is accessible
- [ ] Test authentication (sign up, sign in, sign out)
- [ ] Verify questions load correctly
- [ ] Test all question types (multiple choice, sequence, hotspot)
- [ ] Check filtering and search functionality
- [ ] Verify progress tracking works
- [ ] Test dashboard analytics
- [ ] Check responsive design on mobile
- [ ] Verify all API endpoints are accessible

## Troubleshooting

### Build Fails
- Check TypeScript errors: `npm run type-check`
- Verify all dependencies: `npm install`
- Clear cache: `rm -rf node_modules dist && npm install`

### Questions Not Loading
- Verify Supabase URL and API key are correct
- Check browser console for CORS errors
- Ensure questions table exists and has data
- Verify RLS policies are configured

### Authentication Issues
- Check Supabase authentication settings
- Verify email templates are configured
- Ensure redirect URLs are whitelisted in Supabase

### GitHub Pages 404
- Ensure base path is configured in vite.config.ts
- Check GitHub Pages settings in repository
- Verify gh-pages branch exists

## Performance Optimization

1. **Enable Caching:**
   - Static assets are cached by default
   - API responses cached using React Query

2. **Lazy Loading:**
   - Questions loaded on demand
   - Components code-split automatically

3. **Image Optimization:**
   - Use WebP format where possible
   - Compress images before upload

## Security Considerations

1. **API Keys:**
   - Never commit API keys to repository
   - Use GitHub Secrets for CI/CD
   - Rotate keys regularly

2. **Content Security Policy:**
   - CSP headers configured in vite.config.ts
   - Adjust as needed for your domain

3. **Authentication:**
   - Email verification required
   - Session timeout configured
   - Secure password requirements

## Monitoring

1. **Analytics:**
   - Consider adding Google Analytics or similar
   - Track user engagement and performance

2. **Error Tracking:**
   - Consider Sentry or similar for error monitoring
   - Log API errors for debugging

3. **Performance:**
   - Use Lighthouse for performance audits
   - Monitor Core Web Vitals

## Support

For issues or questions:
- Create an issue on GitHub
- Check the documentation
- Review Supabase and Vite documentation