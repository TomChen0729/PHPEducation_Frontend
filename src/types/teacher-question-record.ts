import type { TeacherBloom, TeacherQuestion, TeacherQuestionType } from './teacher-question';

/*
 * ============================================================
 * Status
 * ============================================================
 */

export type TeacherQuestionRecordStatus = 'pending' | 'correct' | 'wrong';

/*
 * ============================================================
 * Stored Result
 * ============================================================
 *
 * Choice / True False
 * → selected option id (Backend stores string)
 *
 * Fill / Debug / Interpret
 * → { correct, total, answers }
 *
 * Coding
 * → student source code string
 */

export interface TeacherQuestionRecordSubAnswerSummary {
  correct: number;

  total: number;

  answers: Record<string, string>;
}

export type TeacherQuestionRecordResult =
  | string
  | number
  | TeacherQuestionRecordSubAnswerSummary
  | Record<string, unknown>
  | unknown[]
  | null;

/*
 * ============================================================
 * Record Sub
 * ============================================================
 */

export interface TeacherQuestionRecordSub {
  id: number;

  sub_id: number;

  answer: string;

  is_right: boolean;

  solo: number;
}

/*
 * ============================================================
 * Record
 * ============================================================
 */

export interface TeacherQuestionRecord {
  id: number;

  student_id: number;

  student_no: string | null;

  student_name: string | null;

  question_id: number;

  question_title: string | null;

  question_type: TeacherQuestionType;

  result: TeacherQuestionRecordResult;

  solo: number | null;

  /*
   * Coding 題老師覆核後寫入的 Bloom。
   */
  bloom_id: string | null;

  /*
   * 題目本身要求的 Bloom。
   */
  question_bloom_id: string | null;

  starter_code: string | null;

  expected_output: string | null;

  reference_answer: string | null;

  system_status: TeacherQuestionRecordStatus;

  teacher_status: TeacherQuestionRecordStatus;

  subs: TeacherQuestionRecordSub[];

  created_at: string;
}

/*
 * ============================================================
 * API Response
 * ============================================================
 */

export interface TeacherQuestionRecordListResponse {
  records: TeacherQuestionRecord[];
}

export interface TeacherQuestionRecordResponse {
  record: TeacherQuestionRecord;
}

/*
 * ============================================================
 * Review Request
 * ============================================================
 *
 * Coding：
 * { bloom_id: 'B42' }
 *
 * Other Types：
 * { solo: 1 | 2 }
 */

export interface TeacherCodingRecordReviewRequest {
  bloom_id: string;
}

export interface TeacherGeneralRecordReviewRequest {
  solo: 1 | 2;
}

export type TeacherQuestionRecordReviewRequest =
  | TeacherCodingRecordReviewRequest
  | TeacherGeneralRecordReviewRequest;

/*
 * ============================================================
 * Detail State
 * ============================================================
 */

export interface TeacherQuestionRecordDetail {
  record: TeacherQuestionRecord;

  question: TeacherQuestion;

  blooms: TeacherBloom[];
}
