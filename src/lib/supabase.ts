import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

// Get Supabase configuration from environment variables
// These are public anon keys - safe for client-side use
// The anon key is designed to be used in browsers with Row Level Security
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://cezjxkvvtxdmikhwcseb.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlemp4a3Z2dHhkbWlraHdjc2ViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1ODQxMDYsImV4cCI6MjA3MDE2MDEwNn0.HEihErzl6ZJ2JrxS5wbAb3vMsDMCBKWACBQMdvdfNUE';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Using default Supabase configuration');
}

// Create Supabase client with security configurations
export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
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