import { api } from '../boot/axios';

import type {
  StudentKnowledgeCardReadResponse,
  StudentLearningProgressResponse,
} from '../types/student-learning';

export const studentLearningApi = {
  getProgress(courseId: number) {
    return api.get<StudentLearningProgressResponse>(
      `/student/courses/${courseId}/learning-progress`,
    );
  },

  markKnowledgeCardRead(courseId: number, cardId: number) {
    return api.post<StudentKnowledgeCardReadResponse>(
      `/student/courses/${courseId}/knowledge-cards/${cardId}/read`,
    );
  },
};
