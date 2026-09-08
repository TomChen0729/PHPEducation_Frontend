/*
 * ============================================================
 * Student Question Type
 * ============================================================
 *
 * Backend 支援六種題型：
 *
 * choice      選擇題
 * true_false  是非題
 * fill        填空題
 * debug       除錯題
 * interpret   程式解讀題
 * coding      程式實作題
 */

export type StudentQuestionType =
  'choice' | 'true_false' | 'fill' | 'debug' | 'interpret' | 'coding';

/*
 * ============================================================
 * Question Option
 * ============================================================
 *
 * 用於：
 *
 * choice
 * true_false
 *
 * 注意：
 * Student API 不會回傳 is_answer。
 */

export interface StudentQuestionOption {
  id: number;

  title: string;
}

/*
 * ============================================================
 * Student Question
 * ============================================================
 *
 * 題目列表與單題畫面共用。
 *
 * options / sub_answers：
 * 不同題型才會有。
 */

export interface StudentQuestion {
  id: number;

  course_id: number;

  title: string;

  type: StudentQuestionType;

  question_content: string;

  bloom_id?: string | null;

  description?: string | null;

  /*
   * ==========================================================
   * Knowledge Cards
   * ==========================================================
   *
   * 學生只拿 ID。
   *
   * Backend 不會把完整 Knowledge Card
   * 或 example 無條件送給學生。
   */
  knowledge_card_ids?: number[];

  /*
   * ==========================================================
   * Knowledge Card Examples
   * ==========================================================
   *
   * show_example = false
   * → []
   *
   * show_example = true
   * → ["...", "..."]
   *
   * Student 不需要知道 show_example 本身。
   */
  examples?: string[];

  /*
   * ==========================================================
   * Choice / True False
   * ==========================================================
   */
  options?: StudentQuestionOption[];

  /*
   * ==========================================================
   * Fill / Interpret
   * ==========================================================
   *
   * 只回需要回答的 sub_id，
   * 不會回標準答案。
   */
  sub_ids?: number[];

  /*
   * ==========================================================
   * Debug
   * ==========================================================
   *
   * 只告訴學生有幾個錯誤，
   * 不告訴學生錯在哪幾行。
   */
  debug_error_count?: number;

  /*
   * ==========================================================
   * Coding
   * ==========================================================
   *
   * starter_code 可以給學生。
   *
   * expected_output / reference_answer
   * 不會給學生。
   */
  starter_code?: string | null;
}

/*
 * ============================================================
 * Question List Response
 * ============================================================
 *
 * GET
 *
 * /student/courses/{courseId}/questions
 */

export interface StudentQuestionListResponse {
  questions: StudentQuestion[];
}

/*
 * ============================================================
 * Single Question Response
 * ============================================================
 *
 * GET
 *
 * /student/questions/{questionId}
 */

export interface StudentQuestionResponse {
  question: StudentQuestion;
}

/*
 * ============================================================
 * Submit Payload
 * ============================================================
 */

/*
 * Choice / True False
 *
 * Backend：
 *
 * {
 *   option_id: 1
 * }
 */

export interface StudentChoiceSubmitRequest {
  option_id: number;
}

/*
 * Fill / Debug / Interpret
 *
 * Backend：
 *
 * {
 *   answers: {
 *     "1": "define",
 *     "2": "PI"
 *   }
 * }
 */

export interface StudentSubAnswerSubmitRequest {
  answers: Record<string, string>;
}

/*
 * Coding
 *
 * Backend：
 *
 * {
 *   code: "<?php ... ?>"
 * }
 */

export interface StudentCodingSubmitRequest {
  code: string;
}

/*
 * ============================================================
 * Unified Submit Request
 * ============================================================
 */

export type StudentQuestionSubmitRequest =
  StudentChoiceSubmitRequest | StudentSubAnswerSubmitRequest | StudentCodingSubmitRequest;

/*
 * ============================================================
 * Question Result Status
 * ============================================================
 */

export type QuestionSystemStatus = 'correct' | 'wrong' | 'pending';

export type QuestionTeacherStatus = 'correct' | 'wrong' | 'pending';

export interface StudentSubAnswerResult {
  correct: number;

  total: number;

  answers: Record<string, string>;
}

export type StudentQuestionRecordResult = string | number | StudentSubAnswerResult | null;

/*
 * ============================================================
 * Question Record
 * ============================================================
 */

export interface StudentQuestionRecordSub {
  id: number;

  sub_id: number;

  answer: string;

  is_right: boolean;
}

/*
 * ============================================================
 * Question Record
 * ============================================================
 *
 * 學生送出答案後 Backend 建立的作答紀錄。
 */

export interface StudentQuestionRecord {
  id: number;

  student_id: number;

  question_id: number;

  result?: StudentQuestionRecordResult;

  system_status: QuestionSystemStatus;

  teacher_status: QuestionTeacherStatus;

  subs?: StudentQuestionRecordSub[];

  solo?: number | null;

  bloom_id?: string | null;

  created_at?: string;

  updated_at?: string;
}

/*
 * ============================================================
 * Submit Response
 * ============================================================
 *
 * POST
 *
 * /student/questions/{questionId}/submit
 */

export interface StudentQuestionSubmitResponse {
  message: string;

  system_status: QuestionSystemStatus;

  /*
   * Choice / Fill / Debug / Interpret
   * Backend 可能回傳解釋。
   */
  explanation?: string | null;

  /*
   * 目前 Backend 的 Fill / Debug / Interpret
   * 仍可能使用 description 回傳答案說明。
   * 前端暫時相容兩種欄位名稱。
   */
  description?: string | null;

  record: StudentQuestionRecord;
}
