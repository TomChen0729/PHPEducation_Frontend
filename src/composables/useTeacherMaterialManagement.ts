import { ref } from 'vue';

import axios from 'axios';

import { teacherMaterialApi } from '../api/teacher-material.api';

import type {
  KnowledgeCardPayload,
  MaterialDraft,
  MaterialNamePayload,
  PublishedTopic,
} from '../types/material';

export function useTeacherMaterialManagement() {
  /*
   * =========================
   * Draft
   * =========================
   */
  const drafts = ref<MaterialDraft[]>([]);

  /*
   * =========================
   * Published Topics
   * =========================
   */
  const publishedTopics = ref<PublishedTopic[]>([]);

  /*
   * =========================
   * Loading
   * =========================
   */
  const loading = ref(false);

  const downloadingTemplate = ref(false);

  const importing = ref(false);

  const creatingDraft = ref(false);

  const publishingDraftId = ref<number | null>(null);

  /*
   * Topic / Chapter / Unit /
   * Knowledge Card CRUD
   */
  const editing = ref(false);

  /*
   * =========================
   * Error
   * =========================
   */
  const errorMessage = ref('');

  function clearErrorMessage() {
    errorMessage.value = '';
  }

  /*
   * ============================================================
   * GET Draft List
   * ============================================================
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
   * ============================================================
   * GET Published Topics
   * ============================================================
   *
   * GET
   * /teacher/courses/{courseId}/topics
   *
   * 這裡取得的是正式教材 topics table，
   * 不是 MaterialDraft.tree。
   */
  async function fetchPublishedTopics(courseId: number): Promise<void> {
    errorMessage.value = '';

    try {
      const response = await teacherMaterialApi.getPublishedTopics(courseId);

      publishedTopics.value = response.data.topics;
    } catch (error: unknown) {
      errorMessage.value = getApiErrorMessage(error, '已發布主題取得失敗');
    }
  }

  async function fetchPublishedTopicTree(topic: PublishedTopic): Promise<MaterialDraft | null> {
    errorMessage.value = '';

    try {
      const chapterResponse = await teacherMaterialApi.getPublishedChapters(topic.id);

      const chapters = await Promise.all(
        chapterResponse.data.chapters.map(async (chapter) => {
          const unitResponse = await teacherMaterialApi.getPublishedUnits(chapter.id);

          const units = await Promise.all(
            unitResponse.data.units.map(async (unit) => {
              const cardResponse = await teacherMaterialApi.getPublishedKnowledgeCards(unit.id);

              return {
                id: String(unit.id),

                name: unit.name,

                sort_order: unit.sort_order,

                knowledge_cards: cardResponse.data.knowledge_cards.map((card) => ({
                  id: String(card.id),

                  title: card.title,

                  content: card.content,

                  example: card.example,

                  sort_order: card.sort_order,
                })),
              };
            }),
          );

          return {
            id: String(chapter.id),

            name: chapter.name,

            sort_order: chapter.sort_order,

            units,
          };
        }),
      );

      /*
       * 轉成目前 MaterialTreeViewer
       * 可以直接使用的格式。
       */
      return {
        id: -topic.id,

        course_id: 0,

        name: topic.name,

        status: 'published',

        topics: [
          {
            id: String(topic.id),

            name: topic.name,

            sort_order: topic.sort_order,

            chapters,
          },
        ],
      };
    } catch (error: unknown) {
      errorMessage.value = getApiErrorMessage(error, '已發布教材取得失敗');

      return null;
    }
  }

  /*
   * ============================================================
   * Download Template
   * ============================================================
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
   * ============================================================
   * Import Excel
   * ============================================================
   */
  async function importMaterial(
    courseId: number,
    topic: string,
    file: File,
  ): Promise<MaterialDraft | null> {
    importing.value = true;

    errorMessage.value = '';

    try {
      const response = await teacherMaterialApi.importMaterial(courseId, topic, file);

      /*
       * 匯入成功後
       * 重新取得 Draft List。
       */
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
   * ============================================================
   * Published → Draft
   * ============================================================
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
   * ============================================================
   * Publish
   * ============================================================
   */
  async function publishDraft(courseId: number, draftId: number): Promise<boolean> {
    publishingDraftId.value = draftId;

    errorMessage.value = '';

    try {
      await teacherMaterialApi.publish(draftId);

      /*
       * Draft 狀態會改變，
       * 先重新取得 Draft。
       *
       * Published Topic
       * 由 [courseId].vue
       * 成功後另外 refresh。
       */
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
   * ============================================================
   * Replace Draft
   * ============================================================
   *
   * Backend 每次 Draft CRUD
   * 都回傳最新完整 Draft。
   */
  function replaceDraft(updatedDraft: MaterialDraft) {
    drafts.value = drafts.value.map((draft) =>
      draft.id === updatedDraft.id ? updatedDraft : draft,
    );
  }

  /*
   * ============================================================
   * Topic
   * ============================================================
   *
   * 這三個是原本 Draft Topic CRUD。
   * 先保留，避免其他地方仍有使用。
   */

  /*
   * =========================
   * Add Draft Topic
   * =========================
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

  /*
   * =========================
   * Update Draft Topic
   * =========================
   */
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

  /*
   * =========================
   * Delete Draft Topic
   * 舊版函式
   * =========================
   *
   * 回傳 MaterialDraft，
   * 先保留避免其他舊程式使用。
   */
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
   * ============================================================
   * Delete Draft Topic
   * ============================================================
   *
   * [courseId].vue 使用這一支。
   *
   * DELETE
   * /teacher/material-drafts/{draftId}/topics/{nodeId}
   *
   * 成功 → true
   * 失敗 → false
   */
  async function deleteDraftTopic(draftId: number, nodeId: string): Promise<boolean> {
    editing.value = true;

    errorMessage.value = '';

    try {
      const response = await teacherMaterialApi.deleteTopic(draftId, nodeId);

      /*
       * Backend 回傳更新後 Draft，
       * 直接同步本地 drafts。
       */
      replaceDraft(response.data.draft);

      return true;
    } catch (error: unknown) {
      errorMessage.value = getApiErrorMessage(error, '草稿主題刪除失敗');

      return false;
    } finally {
      editing.value = false;
    }
  }

  /*
   * ============================================================
   * Delete Published Topic
   * ============================================================
   *
   * 正式教材 Topic。
   *
   * DELETE
   * /teacher/topics/{topicId}
   *
   * 注意：
   * 這裡的 topicId 是正式 topics.id，
   * 不是 Draft tree nodeId。
   */
  async function deletePublishedTopic(topicId: number): Promise<boolean> {
    editing.value = true;

    errorMessage.value = '';

    try {
      await teacherMaterialApi.deletePublishedTopic(topicId);

      /*
       * 不在這裡自己修改 publishedTopics，
       * [courseId].vue 成功後會呼叫：
       *
       * fetchPublishedTopics(courseId)
       *
       * 重新跟 Backend 同步。
       */
      return true;
    } catch (error: unknown) {
      errorMessage.value = getApiErrorMessage(error, '已發布主題刪除失敗');

      return false;
    } finally {
      editing.value = false;
    }
  }

  /*
   * ============================================================
   * Chapter
   * ============================================================
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
   * ============================================================
   * Unit
   * ============================================================
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
   * ============================================================
   * Knowledge Card
   * ============================================================
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

  /*
   * ============================================================
   * Clear
   * ============================================================
   */
  function clearDrafts() {
    drafts.value = [];

    /*
     * 換課程 / 離開課程時，
     * 正式 Topic 也一起清除。
     */
    publishedTopics.value = [];

    errorMessage.value = '';
  }

  /*
   * ============================================================
   * Return
   * ============================================================
   */
  return {
    /*
     * Data
     */
    drafts,

    publishedTopics,

    /*
     * Loading
     */
    loading,

    downloadingTemplate,

    importing,

    creatingDraft,

    publishingDraftId,

    editing,

    /*
     * Error
     */
    errorMessage,

    /*
     * Fetch
     */
    fetchDrafts,

    fetchPublishedTopics,

    fetchPublishedTopicTree,

    /*
     * Template / Import
     */
    downloadTemplate,

    importMaterial,

    /*
     * Draft
     */
    createDraftFromPublished,

    publishDraft,

    /*
     * Topic
     */
    addTopic,

    updateTopic,

    /*
     * 舊版
     */
    deleteTopic,

    /*
     * 目前 [courseId].vue 使用
     */
    deleteDraftTopic,

    deletePublishedTopic,

    /*
     * Chapter
     */
    addChapter,

    updateChapter,

    deleteChapter,

    /*
     * Unit
     */
    addUnit,

    updateUnit,

    deleteUnit,

    /*
     * Knowledge Card
     */
    addKnowledgeCard,

    updateKnowledgeCard,

    deleteKnowledgeCard,

    /*
     * Clear
     */
    clearDrafts,

    clearErrorMessage,
  };
}

/*
 * ============================================================
 * API Error
 * ============================================================
 */
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
