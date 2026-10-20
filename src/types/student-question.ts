/*
 * ============================================================
 * Student Question / Practice / Knowledge Card Quiz
 * ============================================================
 */

export type StudentQuestionType =
  'choice' | 'true_false' | 'fill' | 'debug' | 'interpret' | 'coding';

export type StudentPracticeScope = 'card' | 'unit' | 'chapter' | 'course';

export type StudentQuestionStatusFilter = 'all' | 'answered' | 'unanswered';

export interface StudentQuestionOption {
  id: number;
  title: string;
}

export interface StudentQuestionKnowledgeCard {
  id: number;
  title: string;
  content?: string;
  example?: string | null;
}

export interface StudentQuestionLockedCard {
  id: number;
  title: string;
}

export interface StudentQuestionReviewSub {
  sub_id: number;
  my_answer: string | null;
  correct_answer: string | null;
  is_right: boolean;
  description: string | null;
}

export interface StudentQuestionReview {
  my_answer: string | null;
  correct_answer: string | null;
  subs: StudentQuestionReviewSub[];
  explanation: string | null;
}

export interface StudentQuestionPractice {
  record_id: number;
  status: QuestionSystemStatus | null;
  answered_at: string | null;
  review?: StudentQuestionReview;
}

export interface StudentQuestion {
  id: number;
  course_id: number;
  title: string;
  type: StudentQuestionType;

  /* 列表 API 不回題目全文，單題 API 才會回。 */
  question_content?: string;
  bloom_id?: string | null;
  description?: string | null;

  knowledge_card_ids?: number[];
  knowledge_cards?: StudentQuestionKnowledgeCard[];
  examples?: string[];

  options?: StudentQuestionOption[];
  sub_ids?: number[];
  debug_error_count?: number;
  starter_code?: string | null;

  /* 正式題目練習資訊 */
  practice?: StudentQuestionPractice | null;
  scope?: StudentPracticeScope;
  scope_unit_ids?: number[];
  scope_chapter_ids?: number[];
  locked?: boolean;
  locked_cards?: StudentQuestionLockedCard[];
}

export interface StudentQuestionStructureCard {
  id: number;
  title: string;
  completed: boolean;
}

export interface StudentQuestionStructureUnit {
  id: number;
  name: string;
  knowledge_cards: StudentQuestionStructureCard[];
}

export interface StudentQuestionStructureChapter {
  id: number;
  name: string;
  units: StudentQuestionStructureUnit[];
}

export interface StudentQuestionListMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface StudentQuestionFilters {
  scope?: StudentPracticeScope | null;
  chapter_id?: number | null;
  unit_id?: number | null;
  knowledge_card_id?: number | null;
  type?: StudentQuestionType | null;
  status?: StudentQuestionStatusFilter | null;
  keyword?: string | null;
  page?: number | null;
  per_page?: number | null;
}

export interface StudentQuestionListResponse {
  questions: StudentQuestion[];
  chapters: StudentQuestionStructureChapter[];
  meta?: StudentQuestionListMeta;
}

export interface StudentQuestionResponse {
  question: StudentQuestion;
}

export interface StudentChoiceSubmitRequest {
  option_id: number;
}

export interface StudentSubAnswerSubmitRequest {
  answers: Record<string, string>;
}

export interface StudentCodingSubmitRequest {
  code: string;
}

export type StudentQuestionSubmitRequest =
  StudentChoiceSubmitRequest | StudentSubAnswerSubmitRequest | StudentCodingSubmitRequest;

export type QuestionSystemStatus = 'correct' | 'wrong' | 'pending';
export type QuestionTeacherStatus = 'correct' | 'wrong' | 'pending';

export interface StudentSubAnswerResult {
  correct: number;
  total: number;
  answers: Record<string, string>;
}

export type StudentQuestionRecordResult = string | number | StudentSubAnswerResult | null;

export interface StudentQuestionRecordSub {
  id: number;
  sub_id: number;
  answer: string;
  is_right: boolean;
  solo?: number | null;
}

export interface StudentQuestionRecord {
  id: number;
  student_id?: number;
  question_id: number;
  question_title?: string | null;
  question_type?: StudentQuestionType | null;
  course_id?: number | null;
  result?: StudentQuestionRecordResult;
  system_status: QuestionSystemStatus;
  teacher_status?: QuestionTeacherStatus | null;
  needs_teacher_review?: boolean;
  subs?: StudentQuestionRecordSub[];
  solo?: number | null;
  bloom_id?: string | null;
  question_bloom_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface StudentQuestionRecordResponse {
  record: StudentQuestionRecord;
}

export interface StudentQuestionSubmitResponse {
  message: string;
  system_status: QuestionSystemStatus;
  explanation?: string | null;
  description?: string | null;
  record: StudentQuestionRecord;
  review?: StudentQuestionReview;
}

/*
 * ============================================================
 * Knowledge Card Quiz (小試身手)
 * ============================================================
 */

export interface StudentKnowledgeCardQuizCard {
  id: number;
  title: string;
  type: string;
  content: string;
  example: string | null;
  chapter: { id: number; name: string } | null;
  unit: { id: number; name: string } | null;
}

export interface StudentKnowledgeCardQuizQuestion extends StudentQuestion {
  answered: boolean;
  correct: boolean;
  last_status: QuestionSystemStatus | null;
}

export interface StudentKnowledgeCardQuizResponse {
  card: StudentKnowledgeCardQuizCard;
  completed: boolean;
  completed_at: string | null;
  completion_method: string | null;
  has_quiz: boolean;
  question_count: number;
  questions: StudentKnowledgeCardQuizQuestion[];
}

export interface StudentKnowledgeCardQuizQuestionStatus {
  answered: boolean;
  correct: boolean;
  last_status: QuestionSystemStatus | null;
}

export interface StudentKnowledgeCardQuizSubmitResponse extends StudentQuestionSubmitResponse {
  question_status: StudentKnowledgeCardQuizQuestionStatus;
  correct_count: number;
  total: number;
  completed: boolean;
  completed_at: string | null;
}
