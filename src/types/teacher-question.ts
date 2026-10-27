/*
 * ============================================================
 * Question Type
 * ============================================================
 */

export type TeacherQuestionType =
  'choice' | 'true_false' | 'fill' | 'debug' | 'interpret' | 'coding';

/*
 * ============================================================
 * Bloom
 * ============================================================
 */

export interface TeacherBloom {
  id: string;

  title: string;

  cognition_info: string | null;
}

export interface TeacherBloomListResponse {
  blooms: TeacherBloom[];
}

/*新增SOLO 層級資料的說明*/
export interface TeacherSolo {
  level: number;
  code: string;
  title: string | null;
  description: string | null;
}

/*
 * ============================================================
 * Knowledge Card Picker
 * ============================================================
 */

export interface TeacherQuestionKnowledgeCardOption {
  id: number;

  title: string;

  example: string | null;

  unit_name: string | null;

  chapter_name: string | null;
}

export interface TeacherQuestionKnowledgeCardListResponse {
  knowledge_cards: TeacherQuestionKnowledgeCardOption[];
}

/*
 * ============================================================
 * Question Knowledge Card
 * ============================================================
 */

export interface TeacherQuestionKnowledgeCard {
  id: number;

  title: string;

  example: string | null;
}

/*
 * ============================================================
 * Option
 * ============================================================
 */

export interface TeacherQuestionOption {
  id: number;

  title: string;

  description: string | null;

  is_answer: boolean;

  solo: number;
}

/* 新增／修改時可指定此選項本身的 SOLO 層級，作答正誤不影響記錄值。 */
export interface TeacherQuestionOptionInput {
  title: string;

  description?: string | null;

  is_answer: boolean;

  solo?: number;
}

/*
 * ============================================================
 * Sub Answer
 * ============================================================
 */

export interface TeacherQuestionSubAnswer {
  id: number;

  sub_id: number;

  answer: string;

  description: string | null;

  solo: number;
}

export interface TeacherQuestionSubAnswerInput {
  sub_id: number;

  answer: string;

  description?: string | null;

  solo?: number;
}

/*
 * ============================================================
 * Question
 * ============================================================
 */

export interface TeacherQuestion {
  id: number;

  course_id: number;

  teacher_id: number;

  title: string;

  type: TeacherQuestionType;

  question_content: string;

  bloom_id: string | null;

  description: string | null;

  show_example: boolean;

  starter_code: string | null;

  expected_output: string | null;

  reference_answer: string | null;

  knowledge_card_ids: number[];

  knowledge_cards: TeacherQuestionKnowledgeCard[];

  options: TeacherQuestionOption[];

  sub_answers: TeacherQuestionSubAnswer[];

  created_at: string;

  updated_at: string;
}

/*
 * ============================================================
 * Request
 * ============================================================
 */

export interface TeacherQuestionRequest {
  title: string;

  type: TeacherQuestionType;

  question_content: string;

  bloom_id: string;

  description: string | null;

  show_example: boolean;

  knowledge_card_ids: number[];

  starter_code?: string | null;

  expected_output?: string | null;

  reference_answer?: string | null;

  options?: TeacherQuestionOptionInput[];

  sub_answers?: TeacherQuestionSubAnswerInput[];
}

/*
 * ============================================================
 * Responses
 * ============================================================
 */

export interface TeacherQuestionListResponse {
  questions: TeacherQuestion[];
}

export interface TeacherQuestionResponse {
  question: TeacherQuestion;
}

export interface DeleteTeacherQuestionResponse {
  message: string;
}
