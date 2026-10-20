export type StudentLearningCardStatus =
  | 'completed'
  | 'retry'
  | 'in_progress'
  | 'not_started';

export interface StudentLearningProgressCard {
  id: number;
  title: string;
  has_quiz: boolean;
  question_total: number;
  answered_count: number;
  correct_count: number;
  status: StudentLearningCardStatus;
  last_answered_at: string | null;
}

export interface StudentLearningProgressUnit {
  id: number;
  name: string;
  total: number;
  completed: number;
  knowledge_cards: StudentLearningProgressCard[];
}

export interface StudentLearningProgressChapter {
  id: number;
  name: string;
  total: number;
  completed: number;
  units: StudentLearningProgressUnit[];
}

export interface StudentLearningProgressSummary {
  completed: number;
  retry: number;
  in_progress: number;
  not_started: number;
}

export interface StudentLearningLastActivity {
  question_id: number;
  question_title: string | null;
  system_status: 'correct' | 'wrong' | 'pending';
  answered_at: string | null;
  knowledge_card: {
    id: number;
    title: string;
    status: StudentLearningCardStatus;
  } | null;
}

export interface StudentLearningProgress {
  course_id: number;
  total: number;
  completed: number;
  summary: StudentLearningProgressSummary;
  last_activity: StudentLearningLastActivity | null;
  chapters: StudentLearningProgressChapter[];
}

export interface StudentLearningProgressResponse {
  progress: StudentLearningProgress;
}

export interface StudentKnowledgeCardReadResponse {
  completed: boolean;
  completed_at: string | null;
}
