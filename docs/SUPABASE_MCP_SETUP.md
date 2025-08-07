# Supabase MCP Server Setup Guide

## Overview

The Supabase MCP server enables direct database access through Claude, allowing for efficient development, testing, and data management of the PL-600 exam prep platform.

## Prerequisites

1. **Supabase Account**: Create a free account at [supabase.com](https://supabase.com)
2. **Supabase Project**: Create a new project for PL-600 exam prep
3. **API Keys**: Obtain your project URL and service role key

## Step 1: Create Supabase Project

1. Go to [app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Configure:
   - **Name**: `pl600-exam-prep`
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to you
   - **Plan**: Free tier is sufficient

4. Wait for project to provision (~2 minutes)

## Step 2: Get API Credentials

Once your project is ready:

1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://YOUR_PROJECT_ID.supabase.co`
   - **Service Role Key**: (secret key with full access)
   - **Anon Key**: (public key for client-side)

## Step 3: Configure Supabase MCP

### Option 1: Environment Variables (Recommended)

Edit the MCP configuration to use environment variables:

```bash
claude mcp edit supabase
```

Add the environment variables:

```json
{
  "command": "npx",
  "args": ["@supabase-community/supabase-mcp"],
  "env": {
    "SUPABASE_URL": "https://YOUR_PROJECT_ID.supabase.co",
    "SUPABASE_SERVICE_ROLE_KEY": "your-service-role-key-here"
  }
}
```

### Option 2: Direct Configuration

Or pass credentials as arguments:

```json
{
  "command": "npx",
  "args": [
    "@supabase-community/supabase-mcp",
    "--url", "https://YOUR_PROJECT_ID.supabase.co",
    "--service-role-key", "your-service-role-key-here"
  ],
  "env": {}
}
```

## Step 4: Configure Application Environment

Create `.env` file in project root:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Never commit the service role key to git!
# This is only for MCP server, not for client-side code
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

## Step 5: Initialize Database Schema

### Using Supabase Dashboard

1. Go to **SQL Editor** in Supabase Dashboard
2. Create a new query
3. Copy and run the schema from `docs/database-schema.sql`

### Using Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref YOUR_PROJECT_ID

# Run migrations
supabase db push
```

## Step 6: Test MCP Connection

After configuration, test the connection:

```bash
# Check MCP status
claude mcp list

# Should show:
# supabase: npx @supabase-community/supabase-mcp - ✓ Connected
```

## Available MCP Commands

Once connected, you can use these Supabase MCP tools in Claude:

### Database Operations
- `create_table` - Create new tables
- `insert_data` - Insert records
- `query_data` - Query with SQL
- `update_data` - Update records
- `delete_data` - Delete records

### Storage Operations
- `upload_file` - Upload to Supabase Storage
- `download_file` - Download files
- `list_files` - List storage contents
- `delete_file` - Remove files

### Auth Operations
- `create_user` - Create new users
- `list_users` - List all users
- `update_user` - Update user data
- `delete_user` - Remove users

### Real-time Operations
- `subscribe` - Subscribe to changes
- `broadcast` - Send real-time messages

## Example Usage in Development

### Insert Sample Questions

```typescript
// Using MCP in Claude
await supabase_mcp.insert_data({
  table: 'questions',
  data: {
    question_number: 'PL600-001',
    question_text: 'What is the primary purpose of Power Platform?',
    question_type: 'multiple-choice',
    options: [
      { id: 'a', text: 'Database management', isCorrect: false },
      { id: 'b', text: 'Low-code application development', isCorrect: true },
      { id: 'c', text: 'Network security', isCorrect: false },
      { id: 'd', text: 'Operating system', isCorrect: false }
    ],
    correct_answer: 'b',
    explanation: {
      correct: 'Power Platform is Microsoft\'s low-code platform for building business applications.',
      incorrect: {
        'a': 'While it can work with databases, this is not its primary purpose.',
        'c': 'Security is a feature, not the primary purpose.',
        'd': 'Power Platform is not an operating system.'
      }
    },
    exam_area: 'architecture',
    difficulty: 2,
    tags: ['fundamentals', 'power-platform', 'overview']
  }
});
```

### Query User Progress

```typescript
// Get user progress
const progress = await supabase_mcp.query_data({
  query: `
    SELECT 
      COUNT(*) as total_attempts,
      SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) as correct_answers,
      AVG(time_spent) as avg_time_spent
    FROM user_progress
    WHERE user_id = $1
  `,
  params: ['user-uuid-here']
});
```

## Security Best Practices

1. **Never expose service role key** in client-side code
2. **Use Row Level Security (RLS)** for all tables
3. **Rotate keys periodically** through Supabase dashboard
4. **Monitor usage** in Supabase dashboard
5. **Set up alerts** for unusual activity

## Troubleshooting

### MCP Connection Failed

1. Check credentials are correct
2. Verify project is active
3. Ensure no firewall blocking
4. Try reconnecting: `claude mcp reconnect supabase`

### Permission Denied Errors

1. Check RLS policies
2. Verify using correct key (service role for MCP)
3. Ensure user has proper permissions

### Rate Limiting

Free tier limits:
- 500MB database
- 1GB bandwidth/month
- 50,000 monthly active users

Monitor usage in Supabase dashboard.

## Database Schema File

Create `supabase/migrations/001_initial_schema.sql`:

```sql
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Questions table
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
  estimated_time INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Create indexes
CREATE INDEX idx_questions_exam_area ON questions(exam_area);
CREATE INDEX idx_questions_difficulty ON questions(difficulty);
CREATE INDEX idx_questions_tags ON questions USING GIN(tags);

-- Add more tables as needed...
```

## Next Steps

1. ✅ Configure Supabase MCP with your credentials
2. ✅ Test connection with `claude mcp list`
3. ✅ Initialize database schema
4. ✅ Start using MCP for development
5. ✅ Build question extraction pipeline
6. ✅ Populate database with questions

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase MCP GitHub](https://github.com/supabase-community/supabase-mcp)
- [MCP Protocol Docs](https://modelcontextprotocol.io)
- [Supabase CLI](https://supabase.com/docs/guides/cli)

---

*Remember: The service role key has full database access. Keep it secure and never commit it to version control!*