import { api } from '../boot/axios';

import type {
  DeleteTeacherQuestionResponse,
  TeacherBloomListResponse,
  TeacherQuestionKnowledgeCardListResponse,
  TeacherQuestionListResponse,
  TeacherQuestionRequest,
  TeacherQuestionResponse,
} from '../types/teacher-question';

export const teacherQuestionApi = {
  /*
   * ==========================================================
   * Bloom
   * ==========================================================
   */
  getBlooms() {
    return api.get<TeacherBloomListResponse>('/teacher/blooms');
  },

  /*
   * ==========================================================
   * Knowledge Cards
   * ==========================================================
   */
  getKnowledgeCards(courseId: number) {
    return api.get<TeacherQuestionKnowledgeCardListResponse>(
      `/teacher/courses/${courseId}/knowledge-cards`,
    );
  },

  /*
   * ==========================================================
   * Questions
   * ==========================================================
   */
  getQuestions(courseId: number) {
    return api.get<TeacherQuestionListResponse>(`/teacher/courses/${courseId}/questions`);
  },

  /*
   * ==========================================================
   * Question
   * ==========================================================
   */
  getQuestion(questionId: number) {
    return api.get<TeacherQuestionResponse>(`/teacher/questions/${questionId}`);
  },

  /*
   * ==========================================================
   * Create
   * ==========================================================
   */
  createQuestion(
    courseId: number,

    data: TeacherQuestionRequest,
  ) {
    return api.post<TeacherQuestionResponse>(`/teacher/courses/${courseId}/questions`, data);
  },

  /*
   * ==========================================================
   * Update
   * ==========================================================
   */
  updateQuestion(
    questionId: number,

    data: TeacherQuestionRequest,
  ) {
    return api.put<TeacherQuestionResponse>(`/teacher/questions/${questionId}`, data);
  },

  /*
   * ==========================================================
   * Delete
   * ==========================================================
   */
  deleteQuestion(questionId: number) {
    return api.delete<DeleteTeacherQuestionResponse>(`/teacher/questions/${questionId}`);
  },
};
