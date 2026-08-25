export interface User {
  id: number;
  email: string;
  full_name: string;
  avatar_url?: string;
  daily_study_hours: number;
  preferred_study_time: string;
  difficulty_preference: string;
  theme_preference: string;
  notifications_enabled: boolean;
  created_at?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface UploadedFileItem {
  id: number;
  original_name: string;
  name?: string;
  file_type: string;
  file_size: number;
  num_pages: number;
  duration_seconds: number;
  subject: string;
  status: string;
  has_summary?: boolean;
  has_quiz?: boolean;
  created_at: string;
}

export interface SummaryItem {
  id: number;
  title: string;
  subject: string;
  overview: string;
  main_concepts: string; // JSON or string
  definitions: string;   // JSON or string
  explanations: string;  // JSON or string
  formulas: string;      // JSON or string
  key_takeaways: string; // JSON or string
  raw_markdown: string;
  estimated_reading_time_mins: number;
  source_type: string;
  file_id?: number;
  created_at: string;
}

export interface ImportantPointItem {
  id: number;
  file_id?: number;
  subject: string;
  category: 'priority_topic' | 'definition' | 'concept' | 'formula' | 'expected_question';
  priority: 'High' | 'Medium' | 'Low';
  topic: string;
  explanation: string;
  formula_or_syntax?: string;
  is_completed: boolean;
  in_revision_queue: boolean;
  created_at: string;
}

export interface QuizQuestionItem {
  id: number;
  type: 'mcq' | 'true_false' | 'fill_blank' | 'short_answer';
  question: string;
  options?: string[];
  correct_answer: string;
  explanation: string;
  topic?: string;
  difficulty?: string;
}

export interface QuizItem {
  id: number;
  title: string;
  subject: string;
  topic: string;
  difficulty: string;
  quiz_type: string;
  num_questions: number;
  questions: QuizQuestionItem[];
  created_at: string;
}

export interface QuizResultItem {
  id: number;
  quiz_id: number;
  score: number;
  total_questions: number;
  percentage: number;
  time_spent_seconds: number;
  ai_feedback: string;
  topic_performance: Record<string, number>;
  answers_breakdown: Array<{
    question_id: number;
    question: string;
    selected_answer: string;
    correct_answer: string;
    is_correct: boolean;
    explanation: string;
    topic: string;
  }>;
  created_at: string;
}

export interface ScheduleSlotItem {
  id: string;
  day: string;
  date: string;
  start_time: string;
  end_time: string;
  subject: string;
  topic: string;
  task_type: string;
  is_completed: boolean;
}

export interface ScheduleDayItem {
  day_number: number;
  day_name: string;
  date: string;
  is_today: boolean;
  slots: ScheduleSlotItem[];
}

export interface StudyScheduleItem {
  id: number;
  title: string;
  start_date: string;
  end_date: string;
  total_days: number;
  daily_hours: number;
  schedule: ScheduleDayItem[];
  created_at: string;
}

export interface DashboardData {
  user_name: string;
  greeting: string;
  statistics: {
    total_study_hours: number;
    materials_uploaded: number;
    quizzes_completed: number;
    average_quiz_score: number;
    current_study_streak: number;
  };
  today_schedule: ScheduleSlotItem[];
  upcoming_exams: Array<{
    id: number;
    subject_name: string;
    exam_date: string;
    days_remaining: number;
    progress_percentage: number;
    priority: string;
  }>;
  recent_materials: Array<{
    id: number;
    name: string;
    file_type: string;
    subject: string;
    size: string;
    date: string;
    status: string;
  }>;
  ai_recommendation: string;
}

export interface ProgressData {
  study_streak_days: number;
  total_study_hours: number;
  topics_completed: number;
  average_quiz_score: number;
  weekly_hours_chart: Array<{ day: string; hours: number; target: number }>;
  quiz_trend_chart: Array<{ quiz_name: string; score: number; date: string }>;
  subject_mastery: Array<{ subject: string; mastery: number; quizzes_taken: number; status: string }>;
  ai_advice: string;
}

export interface ChatMessageItem {
  id?: number;
  role: 'user' | 'assistant';
  content: string;
  created_at?: string;
}

export interface PdfAnswerItem {
  question: string;
  answer: string;
  page_references: number[];
  source_snippets: string[];
  confidence: number;
}
