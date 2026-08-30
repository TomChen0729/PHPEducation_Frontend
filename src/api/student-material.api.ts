import { api } from '../boot/axios';

import type {
  StudentChapterListResponse,
  StudentKnowledgeCardListResponse,
  StudentTopicListResponse,
  StudentUnitListResponse,
} from '../types/student-material';

export const studentMaterialApi = {
  /*
   * =========================
   * Topics
   * =========================
   */
  getTopics(courseId: number) {
    return api.get<StudentTopicListResponse>(`/student/courses/${courseId}/topics`);
  },

  /*
   * =========================
   * Chapters
   * =========================
   */
  getChapters(topicId: number) {
    return api.get<StudentChapterListResponse>(`/student/topics/${topicId}/chapters`);
  },

  /*
   * =========================
   * Units
   * =========================
   */
  getUnits(chapterId: number) {
    return api.get<StudentUnitListResponse>(`/student/chapters/${chapterId}/units`);
  },

  /*
   * =========================
   * Knowledge Cards
   * =========================
   */
  getKnowledgeCards(unitId: number) {
    return api.get<StudentKnowledgeCardListResponse>(`/student/units/${unitId}/knowledge-cards`);
  },
};
