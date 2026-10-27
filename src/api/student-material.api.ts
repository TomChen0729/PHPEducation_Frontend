import { api } from '../boot/axios';

import type {
  StudentChapterListResponse,
  StudentKnowledgeCardListResponse,
  StudentMaterialGraphResponse,
  StudentUnitListResponse,
} from '../types/student-material';
import type { MaterialUnitNode } from '../types/material';

export const studentMaterialApi = {
  /*
   * =========================
   * Chapters
   * =========================
   */
  getChapters(courseId: number) {
    return api.get<StudentChapterListResponse>(`/student/courses/${courseId}/chapters`);
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

  /*
   * =========================
   * Knowledge Graph
   * =========================
   */
  getGraph(courseId: number) {
    return api.get<StudentMaterialGraphResponse>(`/student/courses/${courseId}/graph`);
  },

  // 學生端單一單元知識圖譜查詢
  getUnitGraph(unitId: number) {
    return api.get<{ unit: MaterialUnitNode }>(`/student/units/${unitId}/graph`);
  },
};
