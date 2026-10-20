import { api } from '../boot/axios';

import type {
  StudentKnowledgeCardQuizResponse,
  StudentKnowledgeCardQuizSubmitResponse,
  StudentQuestionFilters,
  StudentQuestionListResponse,
  StudentQuestionRecordResponse,
  StudentQuestionResponse,
  StudentQuestionSubmitRequest,
  StudentQuestionSubmitResponse,
} from '../types/student-question';

export const studentQuestionApi = {
  getQuestions(courseId: number, filters: StudentQuestionFilters = {}) {
    const params = Object.fromEntries(
      Object.entries(filters).filter(([, value]) => value !== null && value !== undefined && value !== ''),
    );

    return api.get<StudentQuestionListResponse>(`/student/courses/${courseId}/questions`, {
      params,
    });
  },

  getQuestion(questionId: number) {
    return api.get<StudentQuestionResponse>(`/student/questions/${questionId}`);
  },

  submitQuestion(questionId: number, data: StudentQuestionSubmitRequest) {
    if ('file' in data) {
      const formData = new FormData();
      formData.append('file', data.file);

      return api.post<StudentQuestionSubmitResponse>(
        `/student/questions/${questionId}/submit`,
        formData,
      );
    }

    return api.post<StudentQuestionSubmitResponse>(`/student/questions/${questionId}/submit`, data);
  },

  getQuestionRecord(recordId: number) {
    return api.get<StudentQuestionRecordResponse>(`/student/question-records/${recordId}`);
  },

  getKnowledgeCardQuiz(courseId: number, cardId: number) {
    return api.get<StudentKnowledgeCardQuizResponse>(
      `/student/courses/${courseId}/knowledge-cards/${cardId}/quiz`,
    );
  },

  submitKnowledgeCardQuizQuestion(
    courseId: number,
    cardId: number,
    questionId: number,
    data: StudentQuestionSubmitRequest,
  ) {
    return api.post<StudentKnowledgeCardQuizSubmitResponse>(
      `/student/courses/${courseId}/knowledge-cards/${cardId}/quiz/questions/${questionId}`,
      data,
    );
  },
};
