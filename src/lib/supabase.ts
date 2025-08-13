import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

// Get Supabase configuration from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing required Supabase environment variables. Please check your .env file.');
  // For development, you can still run the app without Supabase
  console.warn('Running in offline mode - Supabase features will be disabled');
}

// Create Supabase client with security configurations
// Use placeholder values if environment variables are missing to prevent crashes
export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce', // Use PKCE for enhanced security
    storage: {
      // Use secure storage for tokens
      getItem: (key: string) => {
        try {
          return sessionStorage.getItem(key);
        } catch {
          return null;
        }
      },
      setItem: (key: string, value: string) => {
        try {
          sessionStorage.setItem(key, value);
        } catch {
          console.error('Failed to store auth token');
        }
      },
      removeItem: (key: string) => {
        try {
          sessionStorage.removeItem(key);
        } catch {
          console.error('Failed to remove auth token');
        }
      }
    }
  },
  global: {
    headers: {
      'X-Client-Version': '1.0.0'
    }
  },
  db: {
    schema: 'public'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Type exports for better TypeScript support
export type Question = Database['public']['Tables']['questions']['Row'];
export type UserProgress = Database['public']['Tables']['user_progress']['Row'];
export type StudySession = Database['public']['Tables']['study_sessions']['Row'];
export type UserProfile = Database['public']['Tables']['user_profiles']['Row'];
export type QuestionDiscussion = Database['public']['Tables']['question_discussions']['Row'];

// Security utility functions
export async function signInWithMicrosoft() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'azure',
    options: {
      scopes: 'email profile',
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        prompt: 'select_account'
      }
    }
  });

  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  
  // Clear all sensitive data from storage
  sessionStorage.clear();
  localStorage.clear();
}

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}

export async function refreshSession() {
  const { data, error } = await supabase.auth.refreshSession();
  if (error) throw error;
  return data;
}