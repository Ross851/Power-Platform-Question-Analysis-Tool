import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://cezjxkvvtxdmikhwcseb.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlempqa3Z2dHhkbWlraHdjc2ViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcxMjk0MDYsImV4cCI6MjA1MjcwNTQwNn0.qJwjzRqhKC3dWRNnKuAGlrOWBwKHKnZoGP-wVF6Oq7g';

const supabase = createClient(supabaseUrl, supabaseKey);

async function uploadQuestions() {
  try {
    console.log('Loading questions from JSON files...');
    
    // Load all question files
    const masterQuestions = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../src/data/questions-with-breakdown.json'), 'utf8')
    );
    
    const enhancedQuestions = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../src/data/enhanced-questions.json'), 'utf8')
    );
    
    const allExtractedQuestions = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../src/data/all-extracted-questions.json'), 'utf8')
    );
    
    // Combine all questions
    const allQuestions = [
      ...masterQuestions.questions,
      ...enhancedQuestions.questions,
      ...allExtractedQuestions.questions
    ];
    
    console.log(`Found ${allQuestions.length} total questions`);
    
    // First, check if questions table exists and has the right schema
    console.log('Checking database schema...');
    
    // Clear existing questions (optional - remove if you want to append)
    const { error: deleteError } = await supabase
      .from('questions')
      .delete()
      .neq('id', 0); // Delete all rows
    
    if (deleteError && deleteError.code !== '42P01') { // Ignore if table doesn't exist
      console.log('Note: Could not clear existing questions:', deleteError.message);
    }
    
    // Prepare questions for upload
    const questionsToUpload = allQuestions.map((q, index) => {
      // Determine question type
      const questionType = q.type || q.question_type || 'multiplechoice';
      
      // Extract ID
      const questionId = q.id || q.question_number || `q_${index + 1}`;
      
      // Prepare the question object for Supabase
      return {
        id: questionId.toString(),
        question_number: q.question_number || (index + 1).toString(),
        question_text: q.question_text || q.question,
        question_type: questionType,
        options: q.options || q.answers || [],
        correct_answer: q.correct_answer || q.correctAnswer || '',
        correct_order: q.correct_order || null,
        correct_spots: q.correct_spots || null,
        hotspots: q.hotspots || null,
        items: q.items || null,
        image_url: q.image_url || null,
        max_selections: q.max_selections || null,
        explanation: q.explanation || null,
        difficulty: q.difficulty || q.difficultyLevel || 'medium',
        exam_area: q.examArea || q.exam_area || 'general',
        topic: q.topic || '',
        tags: q.tags || [],
        time_limit: q.time_limit || q.estimated_time || 60,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    });
    
    console.log('Uploading questions to Supabase...');
    
    // Upload in batches to avoid timeout
    const batchSize = 20;
    let uploadedCount = 0;
    
    for (let i = 0; i < questionsToUpload.length; i += batchSize) {
      const batch = questionsToUpload.slice(i, i + batchSize);
      
      const { data, error } = await supabase
        .from('questions')
        .upsert(batch, {
          onConflict: 'id',
          ignoreDuplicates: false
        });
      
      if (error) {
        console.error(`Error uploading batch ${i / batchSize + 1}:`, error);
        
        // If table doesn't exist, create it
        if (error.code === '42P01') {
          console.log('Questions table does not exist. Creating table...');
          
          // Note: You'll need to create the table through Supabase dashboard
          // or using SQL editor with appropriate schema
          console.log(`
Please create the 'questions' table in Supabase with the following schema:

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

CREATE INDEX idx_questions_type ON questions(question_type);
CREATE INDEX idx_questions_area ON questions(exam_area);
CREATE INDEX idx_questions_difficulty ON questions(difficulty);
CREATE INDEX idx_questions_active ON questions(is_active);
          `);
          break;
        }
      } else {
        uploadedCount += batch.length;
        console.log(`Uploaded batch ${i / batchSize + 1} (${uploadedCount}/${questionsToUpload.length} questions)`);
      }
    }
    
    if (uploadedCount === questionsToUpload.length) {
      console.log(`✅ Successfully uploaded all ${uploadedCount} questions to Supabase!`);
      
      // Verify upload
      const { count, error: countError } = await supabase
        .from('questions')
        .select('*', { count: 'exact', head: true });
      
      if (!countError) {
        console.log(`✅ Verified: ${count} questions in database`);
      }
    }
    
    // Also create user_progress table if it doesn't exist
    console.log(`
Also ensure the 'user_progress' table exists:

CREATE TABLE user_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id TEXT REFERENCES questions(id),
  is_correct BOOLEAN NOT NULL,
  time_spent INTEGER,
  attempt_number INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_progress_user ON user_progress(user_id);
CREATE INDEX idx_progress_question ON user_progress(question_id);
CREATE INDEX idx_progress_created ON user_progress(created_at);
    `);
    
  } catch (error) {
    console.error('Error uploading questions:', error);
  }
}

// Run the upload
uploadQuestions();