export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      questions: {
        Row: {
          id: string
          question_number: string
          question_text: string
          question_type: string
          options: Json
          correct_answer: Json
          explanation: Json
          exam_area: string
          difficulty: number
          tags: string[]
          microsoft_learn_url: string | null
          estimated_time: number
          created_at: string
          updated_at: string
          is_active: boolean
        }
        Insert: {
          id?: string
          question_number: string
          question_text: string
          question_type: string
          options: Json
          correct_answer: Json
          explanation: Json
          exam_area: string
          difficulty: number
          tags?: string[]
          microsoft_learn_url?: string | null
          estimated_time?: number
          created_at?: string
          updated_at?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          question_number?: string
          question_text?: string
          question_type?: string
          options?: Json
          correct_answer?: Json
          explanation?: Json
          exam_area?: string
          difficulty?: number
          tags?: string[]
          microsoft_learn_url?: string | null
          estimated_time?: number
          created_at?: string
          updated_at?: string
          is_active?: boolean
        }
      }
      user_profiles: {
        Row: {
          id: string
          display_name: string | null
          avatar_url: string | null
          study_goal: string | null
          target_exam_date: string | null
          subscription_tier: string
          subscription_expires_at: string | null
          preferences: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name?: string | null
          avatar_url?: string | null
          study_goal?: string | null
          target_exam_date?: string | null
          subscription_tier?: string
          subscription_expires_at?: string | null
          preferences?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          display_name?: string | null
          avatar_url?: string | null
          study_goal?: string | null
          target_exam_date?: string | null
          subscription_tier?: string
          subscription_expires_at?: string | null
          preferences?: Json
          created_at?: string
          updated_at?: string
        }
      }
      user_progress: {
        Row: {
          id: string
          user_id: string
          question_id: string
          attempt_number: number
          is_correct: boolean
          time_spent: number | null
          confidence_level: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          question_id: string
          attempt_number?: number
          is_correct: boolean
          time_spent?: number | null
          confidence_level?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          question_id?: string
          attempt_number?: number
          is_correct?: boolean
          time_spent?: number | null
          confidence_level?: number | null
          created_at?: string
        }
      }
      study_sessions: {
        Row: {
          id: string
          user_id: string
          session_type: string
          started_at: string
          ended_at: string | null
          questions_attempted: number
          questions_correct: number
          total_time: number | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          session_type: string
          started_at?: string
          ended_at?: string | null
          questions_attempted?: number
          questions_correct?: number
          total_time?: number | null
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          session_type?: string
          started_at?: string
          ended_at?: string | null
          questions_attempted?: number
          questions_correct?: number
          total_time?: number | null
          metadata?: Json
          created_at?: string
        }
      }
      question_discussions: {
        Row: {
          id: string
          question_id: string
          user_id: string
          content: string
          parent_id: string | null
          upvotes: number
          is_expert_verified: boolean
          is_pinned: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          question_id: string
          user_id: string
          content: string
          parent_id?: string | null
          upvotes?: number
          is_expert_verified?: boolean
          is_pinned?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          question_id?: string
          user_id?: string
          content?: string
          parent_id?: string | null
          upvotes?: number
          is_expert_verified?: boolean
          is_pinned?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_user_stats: {
        Args: {
          p_user_id: string
        }
        Returns: {
          total_questions: number
          questions_attempted: number
          questions_correct: number
          accuracy_rate: number
          avg_time_spent: number
          study_streak: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}