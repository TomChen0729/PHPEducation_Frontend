import { api } from '../boot/axios';

import type {
  KnowledgeCardPayload,
  MaterialDraftListResponse,
  MaterialDraftResponse,
  MaterialNamePayload,
  MaterialPublishResponse,
  PublishedTopic,
} from '../types/material';

export const teacherMaterialApi = {
  /*
   * =========================
   * Excel Template
   * =========================
   */
  downloadTemplate() {
    return api.get<Blob>('/teacher/materials/template', {
      responseType: 'blob',
    });
  },

  /*
   * =========================
   * Material Import
   * =========================
   */
  importMaterial(courseId: number, topic: string, file: File) {
    const formData = new FormData();

    /*
     * 主題名稱
     */
    formData.append('topic', topic.trim());

    /*
     * Excel
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
   * Published → Draft
   * =========================
   */
  createDraftFromPublished(courseId: number, topicId: number) {
    return api.post<MaterialDraftResponse>(`/teacher/courses/${courseId}/material-drafts`, {
      topic_id: topicId,
    });
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

  getPublishedChapters(topicId: number) {
    return api.get<{
      chapters: Array<{
        id: number;
        name: string;
        sort_order: number;
        item_count: number;
      }>;
    }>(`/teacher/topics/${topicId}/chapters`);
  },

  getPublishedUnits(chapterId: number) {
    return api.get<{
      units: Array<{
        id: number;
        name: string;
        sort_order: number;
        item_count: number;
      }>;
    }>(`/teacher/chapters/${chapterId}/units`);
  },

  getPublishedKnowledgeCards(unitId: number) {
    return api.get<{
      knowledge_cards: Array<{
        id: number;
        title: string;
        content: string;
        example: string | null;
        sort_order: number;
      }>;
    }>(`/teacher/units/${unitId}/knowledge-cards`);
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

  /*
   * =========================
   * Draft Topic
   * =========================
   */
  deleteDraftTopic(draftId: number, nodeId: string) {
    return api.delete(`/teacher/material-drafts/${draftId}/topics/${nodeId}`);
  },

  /*
   * =========================
   * Published Topic
   * =========================
   */
  deletePublishedTopic(topicId: number) {
    return api.delete<{
      message: string;
    }>(`/teacher/topics/${topicId}`);
  },

  getPublishedTopics(courseId: number) {
    return api.get<{
      topics: PublishedTopic[];
    }>(`/teacher/courses/${courseId}/topics`);
  },
};
