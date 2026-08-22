import { api } from '../boot/axios';

import type {
  KnowledgeCardPayload,
  MaterialDraftListResponse,
  MaterialDraftResponse,
  MaterialNamePayload,
  MaterialPublishResponse,
} from '../types/material';

export const teacherMaterialApi = {
  /*
   * =========================
   * Excel 範本
   * =========================
   */
  downloadTemplate() {
    return api.get<Blob>('/teacher/materials/template', {
      responseType: 'blob',
    });
  },

  /*
   * =========================
   * Excel 匯入
   * =========================
   */
  importMaterial(courseId: number, file: File) {
    const formData = new FormData();

    /*
     * Backend 要求欄位名稱一定是：
     *
     * file
     */
    formData.append('file', file, file.name);

    return api.post<MaterialDraftResponse>(
      `/teacher/courses/${courseId}/materials/import`,
      formData,
    );
  },

  /*
   * =========================
   * Draft List
   * =========================
   */
  listDrafts(courseId: number) {
    return api.get<MaterialDraftListResponse>(`/teacher/courses/${courseId}/material-drafts`);
  },

  /*
   * =========================
   * 從 Published 建立 Draft
   * =========================
   */
  createDraftFromPublished(courseId: number) {
    return api.post<MaterialDraftResponse>(`/teacher/courses/${courseId}/material-drafts`);
  },

  /*
   * =========================
   * Topic
   * =========================
   */
  addTopic(draftId: number, data: MaterialNamePayload) {
    return api.post<MaterialDraftResponse>(`/teacher/material-drafts/${draftId}/topics`, data);
  },

  updateTopic(draftId: number, nodeId: string, data: MaterialNamePayload) {
    return api.put<MaterialDraftResponse>(
      `/teacher/material-drafts/${draftId}/topics/${nodeId}`,
      data,
    );
  },

  deleteTopic(draftId: number, nodeId: string) {
    return api.delete<MaterialDraftResponse>(
      `/teacher/material-drafts/${draftId}/topics/${nodeId}`,
    );
  },

  /*
   * =========================
   * Chapter
   * =========================
   */
  addChapter(draftId: number, topicId: string, data: MaterialNamePayload) {
    return api.post<MaterialDraftResponse>(
      `/teacher/material-drafts/${draftId}/topics/${topicId}/chapters`,
      data,
    );
  },

  updateChapter(draftId: number, nodeId: string, data: MaterialNamePayload) {
    return api.put<MaterialDraftResponse>(
      `/teacher/material-drafts/${draftId}/chapters/${nodeId}`,
      data,
    );
  },

  deleteChapter(draftId: number, nodeId: string) {
    return api.delete<MaterialDraftResponse>(
      `/teacher/material-drafts/${draftId}/chapters/${nodeId}`,
    );
  },

  /*
   * =========================
   * Unit
   * =========================
   */
  addUnit(draftId: number, chapterId: string, data: MaterialNamePayload) {
    return api.post<MaterialDraftResponse>(
      `/teacher/material-drafts/${draftId}/chapters/${chapterId}/units`,
      data,
    );
  },

  updateUnit(draftId: number, nodeId: string, data: MaterialNamePayload) {
    return api.put<MaterialDraftResponse>(
      `/teacher/material-drafts/${draftId}/units/${nodeId}`,
      data,
    );
  },

  deleteUnit(draftId: number, nodeId: string) {
    return api.delete<MaterialDraftResponse>(`/teacher/material-drafts/${draftId}/units/${nodeId}`);
  },

  /*
   * =========================
   * Knowledge Card
   * =========================
   */
  addKnowledgeCard(draftId: number, unitId: string, data: KnowledgeCardPayload) {
    return api.post<MaterialDraftResponse>(
      `/teacher/material-drafts/${draftId}/units/${unitId}/knowledge-cards`,
      data,
    );
  },

  updateKnowledgeCard(draftId: number, nodeId: string, data: KnowledgeCardPayload) {
    return api.put<MaterialDraftResponse>(
      `/teacher/material-drafts/${draftId}/knowledge-cards/${nodeId}`,
      data,
    );
  },

  deleteKnowledgeCard(draftId: number, nodeId: string) {
    return api.delete<MaterialDraftResponse>(
      `/teacher/material-drafts/${draftId}/knowledge-cards/${nodeId}`,
    );
  },

  /*
   * =========================
   * Publish
   * =========================
   */
  publish(draftId: number) {
    return api.post<MaterialPublishResponse>(`/teacher/material-drafts/${draftId}/publish`);
  },
};
