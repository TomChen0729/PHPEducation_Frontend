import { api } from '../boot/axios';

import type {
  KnowledgeCardPayload,
  MaterialChapterListResponse,
  MaterialChapterResponse,
  MaterialCourseTreeResponse,
  MaterialDeleteResponse,
  MaterialEditorImageUploadResponse,
  MaterialImportPayload,
  MaterialImportPreviewResponse,
  MaterialImportResponse,
  MaterialKnowledgeCardListResponse,
  MaterialKnowledgeCardResponse,
  MaterialNamePayload,
  MaterialUnitListResponse,
  MaterialUnitNode,
  MaterialUnitPayload,
  MaterialUnitResponse,
} from '../types/material';

/*
 * ============================================================
 * Teacher Material API
 * ============================================================
 */

export const teacherMaterialApi = {
  /*
   * ==========================================================
   * Excel Template
   * ==========================================================
   *
   * GET
   * /teacher/materials/template
   */

  downloadTemplate() {
    return api.get<Blob>('/teacher/materials/template', {
      responseType: 'blob',
    });
  },

  /*
   * ==========================================================
   * Import Material
   * ==========================================================
   */

  previewImport(
    courseId: number,

    data: MaterialImportPayload,
  ) {
    const formData = buildMaterialImportFormData(data, false);

    return api.post<MaterialImportPreviewResponse>(
      `/teacher/courses/${courseId}/materials/import/preview`,
      formData,
    );
  },

  importMaterial(
    courseId: number,

    data: MaterialImportPayload,
  ) {
    const formData = buildMaterialImportFormData(data, true);

    return api.post<MaterialImportResponse>(
      `/teacher/courses/${courseId}/materials/import`,
      formData,
    );
  },

  /*
   * ==========================================================
   * Course Tree
   * ==========================================================
   */

  getCourseTree(courseId: number) {
    return api.get<MaterialCourseTreeResponse>(`/teacher/courses/${courseId}/tree`);
  },

  // 教師端單一單元知識圖譜查詢
  getUnitGraph(unitId: number) {
    return api.get<{ unit: MaterialUnitNode }>(`/teacher/units/${unitId}/graph`);
  },

  /*
   * ==========================================================
   * Chapter
   * ==========================================================
   */

  listChapters(courseId: number) {
    return api.get<MaterialChapterListResponse>(`/teacher/courses/${courseId}/chapters`);
  },

  createChapter(courseId: number, data: MaterialNamePayload) {
    return api.post<MaterialChapterResponse>(`/teacher/courses/${courseId}/chapters`, data);
  },

  updateChapter(
    chapterId: number,

    data: MaterialNamePayload,
  ) {
    return api.put<MaterialChapterResponse>(`/teacher/chapters/${chapterId}`, data);
  },

  deleteChapter(chapterId: number) {
    return api.delete<MaterialDeleteResponse>(`/teacher/chapters/${chapterId}`);
  },

  /*
   * ==========================================================
   * Unit
   * ==========================================================
   */

  listUnits(chapterId: number) {
    return api.get<MaterialUnitListResponse>(`/teacher/chapters/${chapterId}/units`);
  },

  createUnit(
    chapterId: number,

    data: MaterialUnitPayload,
  ) {
    return api.post<MaterialUnitResponse>(`/teacher/chapters/${chapterId}/units`, data);
  },

  updateUnit(
    unitId: number,

    data: MaterialUnitPayload,
  ) {
    return api.put<MaterialUnitResponse>(`/teacher/units/${unitId}`, data);
  },

  deleteUnit(unitId: number) {
    return api.delete<MaterialDeleteResponse>(`/teacher/units/${unitId}`);
  },

  /*
   * ==========================================================
   * Knowledge Card
   * ==========================================================
   */

  listKnowledgeCards(unitId: number) {
    return api.get<MaterialKnowledgeCardListResponse>(`/teacher/units/${unitId}/knowledge-cards`);
  },

  createKnowledgeCard(
    unitId: number,

    data: KnowledgeCardPayload,
  ) {
    return api.post<MaterialKnowledgeCardResponse>(
      `/teacher/units/${unitId}/knowledge-cards`,
      data,
    );
  },

  updateKnowledgeCard(
    cardId: number,

    data: KnowledgeCardPayload,
  ) {
    return api.put<MaterialKnowledgeCardResponse>(`/teacher/knowledge-cards/${cardId}`, data);
  },

  deleteKnowledgeCard(cardId: number) {
    return api.delete<MaterialDeleteResponse>(`/teacher/knowledge-cards/${cardId}`);
  },

  /*
   * ==========================================================
   * Editor Image
   * ==========================================================
   *
   * POST
   * /teacher/upload-image
   *
   * multipart：
   *
   * image
   *
   * 最大 5MB。
   */

  uploadEditorImage(image: File) {
    const formData = new FormData();

    formData.append('image', image, image.name);

    return api.post<MaterialEditorImageUploadResponse>('/teacher/upload-image', formData);
  },
};


function buildMaterialImportFormData(
  data: MaterialImportPayload,
  includeFingerprint: boolean,
) {
  const formData = new FormData();

  formData.append('file', data.file, data.file.name);

  if (data.mode) {
    formData.append('mode', data.mode);
  }

  if (data.mode === 'replace' && data.chapter_id !== null && data.chapter_id !== undefined) {
    formData.append('chapter_id', String(data.chapter_id));
  }

  if (includeFingerprint && data.fingerprint) {
    formData.append('fingerprint', data.fingerprint);
  }

  return formData;
}
