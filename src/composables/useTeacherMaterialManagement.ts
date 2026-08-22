import { ref } from 'vue';

import axios from 'axios';

import { teacherMaterialApi } from '../api/teacher-material.api';

import type { KnowledgeCardPayload, MaterialDraft, MaterialNamePayload } from '../types/material';

export function useTeacherMaterialManagement() {
  const drafts = ref<MaterialDraft[]>([]);

  const loading = ref(false);

  const downloadingTemplate = ref(false);

  const importing = ref(false);

  const creatingDraft = ref(false);

  const publishingDraftId = ref<number | null>(null);

  /*
   * 教材節點新增 / 修改 / 刪除 Loading
   */
  const editing = ref(false);

  const errorMessage = ref('');

  function clearErrorMessage() {
    errorMessage.value = '';
  }

  /*
   * =================================
   * Draft List
   * =================================
   */
  async function fetchDrafts(courseId: number): Promise<void> {
    loading.value = true;

    errorMessage.value = '';

    try {
      const response = await teacherMaterialApi.listDrafts(courseId);

      drafts.value = response.data.drafts;
    } catch (error: unknown) {
      errorMessage.value = getApiErrorMessage(error, '教材資料取得失敗');
    } finally {
      loading.value = false;
    }
  }

  /*
   * =================================
   * Template
   * =================================
   */
  async function downloadTemplate(): Promise<boolean> {
    downloadingTemplate.value = true;

    errorMessage.value = '';

    try {
      const response = await teacherMaterialApi.downloadTemplate();

      const blobUrl = URL.createObjectURL(response.data);

      const link = document.createElement('a');

      link.href = blobUrl;

      link.download = '教材匯入範本.xlsx';

      document.body.appendChild(link);

      link.click();

      link.remove();

      URL.revokeObjectURL(blobUrl);

      return true;
    } catch (error: unknown) {
      errorMessage.value = getApiErrorMessage(error, '教材範本下載失敗');

      return false;
    } finally {
      downloadingTemplate.value = false;
    }
  }

  /*
   * =================================
   * Excel Import
   * =================================
   */
  async function importMaterial(courseId: number, file: File): Promise<MaterialDraft | null> {
    importing.value = true;

    errorMessage.value = '';

    try {
      const response = await teacherMaterialApi.importMaterial(courseId, file);

      await fetchDrafts(courseId);

      return response.data.draft;
    } catch (error: unknown) {
      errorMessage.value = getApiErrorMessage(error, '教材匯入失敗');

      return null;
    } finally {
      importing.value = false;
    }
  }

  /*
   * =================================
   * Published → Draft
   * =================================
   */
  async function createDraftFromPublished(courseId: number): Promise<MaterialDraft | null> {
    creatingDraft.value = true;

    errorMessage.value = '';

    try {
      const response = await teacherMaterialApi.createDraftFromPublished(courseId);

      await fetchDrafts(courseId);

      return response.data.draft;
    } catch (error: unknown) {
      errorMessage.value = getApiErrorMessage(error, '建立編輯草稿失敗');

      return null;
    } finally {
      creatingDraft.value = false;
    }
  }

  /*
   * =================================
   * Publish
   * =================================
   */
  async function publishDraft(courseId: number, draftId: number): Promise<boolean> {
    publishingDraftId.value = draftId;

    errorMessage.value = '';

    try {
      await teacherMaterialApi.publish(draftId);

      await fetchDrafts(courseId);

      return true;
    } catch (error: unknown) {
      errorMessage.value = getApiErrorMessage(error, '教材發布失敗');

      return false;
    } finally {
      publishingDraftId.value = null;
    }
  }

  /*
   * =================================
   * 更新前端 Draft
   * =================================
   */
  function replaceDraft(updatedDraft: MaterialDraft) {
    drafts.value = drafts.value.map((draft) =>
      draft.id === updatedDraft.id ? updatedDraft : draft,
    );
  }

  /*
   * =================================
   * Topic
   * =================================
   */
  async function addTopic(
    draftId: number,
    data: MaterialNamePayload,
  ): Promise<MaterialDraft | null> {
    editing.value = true;
    errorMessage.value = '';

    try {
      const response = await teacherMaterialApi.addTopic(draftId, data);

      replaceDraft(response.data.draft);

      return response.data.draft;
    } catch (error: unknown) {
      errorMessage.value = getApiErrorMessage(error, '新增主題失敗');

      return null;
    } finally {
      editing.value = false;
    }
  }

  async function updateTopic(
    draftId: number,
    nodeId: string,
    data: MaterialNamePayload,
  ): Promise<MaterialDraft | null> {
    editing.value = true;
    errorMessage.value = '';

    try {
      const response = await teacherMaterialApi.updateTopic(draftId, nodeId, data);

      replaceDraft(response.data.draft);

      return response.data.draft;
    } catch (error: unknown) {
      errorMessage.value = getApiErrorMessage(error, '修改主題失敗');

      return null;
    } finally {
      editing.value = false;
    }
  }

  async function deleteTopic(draftId: number, nodeId: string): Promise<MaterialDraft | null> {
    editing.value = true;
    errorMessage.value = '';

    try {
      const response = await teacherMaterialApi.deleteTopic(draftId, nodeId);

      replaceDraft(response.data.draft);

      return response.data.draft;
    } catch (error: unknown) {
      errorMessage.value = getApiErrorMessage(error, '刪除主題失敗');

      return null;
    } finally {
      editing.value = false;
    }
  }

  /*
   * =================================
   * Chapter
   * =================================
   */
  async function addChapter(
    draftId: number,
    topicId: string,
    data: MaterialNamePayload,
  ): Promise<MaterialDraft | null> {
    editing.value = true;
    errorMessage.value = '';

    try {
      const response = await teacherMaterialApi.addChapter(draftId, topicId, data);

      replaceDraft(response.data.draft);

      return response.data.draft;
    } catch (error: unknown) {
      errorMessage.value = getApiErrorMessage(error, '新增章節失敗');

      return null;
    } finally {
      editing.value = false;
    }
  }

  async function updateChapter(
    draftId: number,
    nodeId: string,
    data: MaterialNamePayload,
  ): Promise<MaterialDraft | null> {
    editing.value = true;
    errorMessage.value = '';

    try {
      const response = await teacherMaterialApi.updateChapter(draftId, nodeId, data);

      replaceDraft(response.data.draft);

      return response.data.draft;
    } catch (error: unknown) {
      errorMessage.value = getApiErrorMessage(error, '修改章節失敗');

      return null;
    } finally {
      editing.value = false;
    }
  }

  async function deleteChapter(draftId: number, nodeId: string): Promise<MaterialDraft | null> {
    editing.value = true;
    errorMessage.value = '';

    try {
      const response = await teacherMaterialApi.deleteChapter(draftId, nodeId);

      replaceDraft(response.data.draft);

      return response.data.draft;
    } catch (error: unknown) {
      errorMessage.value = getApiErrorMessage(error, '刪除章節失敗');

      return null;
    } finally {
      editing.value = false;
    }
  }

  /*
   * =================================
   * Unit
   * =================================
   */
  async function addUnit(
    draftId: number,
    chapterId: string,
    data: MaterialNamePayload,
  ): Promise<MaterialDraft | null> {
    editing.value = true;
    errorMessage.value = '';

    try {
      const response = await teacherMaterialApi.addUnit(draftId, chapterId, data);

      replaceDraft(response.data.draft);

      return response.data.draft;
    } catch (error: unknown) {
      errorMessage.value = getApiErrorMessage(error, '新增單元失敗');

      return null;
    } finally {
      editing.value = false;
    }
  }

  async function updateUnit(
    draftId: number,
    nodeId: string,
    data: MaterialNamePayload,
  ): Promise<MaterialDraft | null> {
    editing.value = true;
    errorMessage.value = '';

    try {
      const response = await teacherMaterialApi.updateUnit(draftId, nodeId, data);

      replaceDraft(response.data.draft);

      return response.data.draft;
    } catch (error: unknown) {
      errorMessage.value = getApiErrorMessage(error, '修改單元失敗');

      return null;
    } finally {
      editing.value = false;
    }
  }

  async function deleteUnit(draftId: number, nodeId: string): Promise<MaterialDraft | null> {
    editing.value = true;
    errorMessage.value = '';

    try {
      const response = await teacherMaterialApi.deleteUnit(draftId, nodeId);

      replaceDraft(response.data.draft);

      return response.data.draft;
    } catch (error: unknown) {
      errorMessage.value = getApiErrorMessage(error, '刪除單元失敗');

      return null;
    } finally {
      editing.value = false;
    }
  }

  /*
   * =================================
   * Knowledge Card
   * =================================
   */
  async function addKnowledgeCard(
    draftId: number,
    unitId: string,
    data: KnowledgeCardPayload,
  ): Promise<MaterialDraft | null> {
    editing.value = true;
    errorMessage.value = '';

    try {
      const response = await teacherMaterialApi.addKnowledgeCard(draftId, unitId, data);

      replaceDraft(response.data.draft);

      return response.data.draft;
    } catch (error: unknown) {
      errorMessage.value = getApiErrorMessage(error, '新增知識卡失敗');

      return null;
    } finally {
      editing.value = false;
    }
  }

  async function updateKnowledgeCard(
    draftId: number,
    nodeId: string,
    data: KnowledgeCardPayload,
  ): Promise<MaterialDraft | null> {
    editing.value = true;
    errorMessage.value = '';

    try {
      const response = await teacherMaterialApi.updateKnowledgeCard(draftId, nodeId, data);

      replaceDraft(response.data.draft);

      return response.data.draft;
    } catch (error: unknown) {
      errorMessage.value = getApiErrorMessage(error, '修改知識卡失敗');

      return null;
    } finally {
      editing.value = false;
    }
  }

  async function deleteKnowledgeCard(
    draftId: number,
    nodeId: string,
  ): Promise<MaterialDraft | null> {
    editing.value = true;
    errorMessage.value = '';

    try {
      const response = await teacherMaterialApi.deleteKnowledgeCard(draftId, nodeId);

      replaceDraft(response.data.draft);

      return response.data.draft;
    } catch (error: unknown) {
      errorMessage.value = getApiErrorMessage(error, '刪除知識卡失敗');

      return null;
    } finally {
      editing.value = false;
    }
  }

  function clearDrafts() {
    drafts.value = [];
    errorMessage.value = '';
  }

  return {
    drafts,

    loading,
    downloadingTemplate,
    importing,
    creatingDraft,
    publishingDraftId,
    editing,

    errorMessage,

    fetchDrafts,
    downloadTemplate,
    importMaterial,
    createDraftFromPublished,
    publishDraft,

    addTopic,
    updateTopic,
    deleteTopic,

    addChapter,
    updateChapter,
    deleteChapter,

    addUnit,
    updateUnit,
    deleteUnit,

    addKnowledgeCard,
    updateKnowledgeCard,
    deleteKnowledgeCard,

    clearDrafts,
    clearErrorMessage,
  };
}

function getApiErrorMessage(error: unknown, fallback: string): string {
  if (!axios.isAxiosError(error)) {
    return fallback;
  }

  const data = error.response?.data as
    | {
        message?: string;

        errors?: Record<string, string[]>;
      }
    | undefined;

  const validationMessage = data?.errors
    ? Object.values(data.errors).flat().find(Boolean)
    : undefined;

  return validationMessage ?? data?.message ?? fallback;
}
