export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface QuestionExplanation {
  correct: string;
  incorrect: Record<string, string>;
  question_breakdown?: {
    key_phrases: Array<{
      phrase: string;
      significance: string;
      what_to_look_for: string;
    }>;
    distractors_analysis: Array<{
      option: string;
      why_tempting: string;
      red_flags: string[];
      elimination_strategy: string;
    }>;
    exam_strategy: {
      time_allocation: string;
      priority_level: string;
      common_variations: string[];
      related_questions: string[];
      scoring_weight: string;
    };
    critical_thinking: {
      assumptions_to_validate: string[];
      constraints_to_consider: string[];
      trade_offs_to_evaluate: string[];
      stakeholders_impacted: string[];
    };
    answer_validation: {
      must_have_elements: string[];
      automatic_eliminators: string[];
      partial_credit_scenarios?: string[];
    };
  };
  deep_dive?: {
    why_it_matters: string;
    real_world_scenario: string;
    common_mistakes: string[];
    best_practices: string[];
    when_to_use: string;
    when_not_to_use: string;
    related_concepts: string[];
    expert_tip: string;
    architecture_considerations?: string;
    security_implications?: string;
    performance_impact?: string;
    cost_analysis?: string;
  };
}

export interface Question {
  id?: string;
  question_number: string;
  question_text: string;
  question_type: 'multiple-choice' | 'hotspot' | 'drag-drop' | 'case-study';
  options: QuestionOption[];
  correct_answer: string | string[];
  explanation: QuestionExplanation;
  exam_area: 'envisioning' | 'architecture' | 'implementation';
  difficulty: number;
  tags: string[];
  microsoft_learn_url?: string;
  estimated_time: number;
  created_at?: string;
  updated_at?: string;
  is_active?: boolean;
}

export interface QuestionData {
  version: string;
  lastUpdated: string;
  totalQuestions: number;
  examInfo: ExamInfo;
  questions: Question[];
}

export interface ExamInfo {
  code: string;
  name: string;
  duration: number;
  passingScore: number;
  totalPoints: number;
  questionCount: number;
  areas: ExamArea[];
}

export interface ExamArea {
  name: string;
  weight: number;
}

export interface UserProgress {
  id?: string;
  user_id: string;
  question_id: string;
  attempt_number: number;
  is_correct: boolean;
  time_spent: number;
  confidence_level?: number;
  created_at?: string;
}

export interface StudySession {
  id?: string;
  user_id: string;
  session_type: 'practice' | 'exam' | 'focus' | 'flashcard' | 'lab';
  started_at: string;
  ended_at?: string;
  questions_attempted: number;
  questions_correct: number;
  total_time?: number;
  metadata?: Record<string, any>;
}