import { api } from '../boot/axios';

import type {
  StudentQuestionListResponse,
  StudentQuestionResponse,
  StudentQuestionSubmitRequest,
  StudentQuestionSubmitResponse,
} from '../types/student-question';

/*
 * ============================================================
 * Student Question API
 * ============================================================
 *
 * 學生題目流程：
 *
 * 1. 取得某課程的題目
 * 2. 取得單一題目
 * 3. 提交答案
 */

export const studentQuestionApi = {
  /*
   * ==========================================================
   * Question List
   * ==========================================================
   *
   * GET
   *
   * /student/courses/{courseId}/questions
   *
   * 可選：
   *
   * ?knowledge_card_id={knowledgeCardId}
   */
  getQuestions(courseId: number, knowledgeCardId?: number) {
    return api.get<StudentQuestionListResponse>(`/student/courses/${courseId}/questions`, {
      params:
        knowledgeCardId !== undefined
          ? {
              knowledge_card_id: knowledgeCardId,
            }
          : undefined,
    });
  },

  /*
   * ==========================================================
   * Single Question
   * ==========================================================
   *
   * GET
   *
   * /student/questions/{questionId}
   */
  getQuestion(questionId: number) {
    return api.get<StudentQuestionResponse>(`/student/questions/${questionId}`);
  },

  /*
   * ==========================================================
   * Submit Question
   * ==========================================================
   *
   * POST
   *
   * /student/questions/{questionId}/submit
   *
   * Payload 依題型不同：
   *
   * Choice / True False
   * {
   *   option_id: 1
   * }
   *
   * Fill / Debug / Interpret
   * {
   *   answers: {
   *     "1": "...",
   *     "2": "..."
   *   }
   * }
   *
   * Coding
   * {
   *   code: "..."
   * }
   */
  submitQuestion(questionId: number, data: StudentQuestionSubmitRequest) {
    return api.post<StudentQuestionSubmitResponse>(`/student/questions/${questionId}/submit`, data);
  },
};
