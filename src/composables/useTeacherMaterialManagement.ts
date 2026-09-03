import { computed, ref } from 'vue';

import { isAxiosError } from 'axios';

import { teacherMaterialApi } from '../api/teacher-material.api';

import type {
  KnowledgeCardPayload,
  MaterialCourseTree,
  MaterialKnowledgeCardNode,
  MaterialNamePayload,
} from '../types/material';

/*
 * ============================================================
 * API Error
 * ============================================================
 */

interface ApiErrorResponse {
  message?: string;

  errors?: Record<string, string[] | string>;
}

/*
 * ============================================================
 * Teacher Material Management
 * ============================================================
 */

export function useTeacherMaterialManagement() {
  /*
   * ==========================================================
   * Course
   * ==========================================================
   *
   * 記錄目前正在管理哪一門 Course。
   *
   * CRUD 完成後需要利用它重新取得整棵 Tree。
   */

  const currentCourseId = ref<number | null>(null);

  /*
   * ==========================================================
   * Course Tree
   * ==========================================================
   */

  const courseTree = ref<MaterialCourseTree | null>(null);

  /*
   * ==========================================================
   * Loading
   * ==========================================================
   */

  /*
   * 取得整棵教材。
   */
  const loading = ref(false);

  /*
   * 下載 Excel 範本。
   */
  const downloadingTemplate = ref(false);

  /*
   * Excel 匯入教材。
   */
  const importing = ref(false);

  /*
   * Chapter / Unit / Card
   * 新增、修改、刪除。
   */
  const editing = ref(false);

  /*
   * RichTextEditor 圖片上傳。
   */
  const uploadingImage = ref(false);

  /*
   * ==========================================================
   * Error
   * ==========================================================
   */

  const errorMessage = ref('');

  /*
   * 保留 HTTP Status，
   * 下一階段 Dialog 可以依需要處理：
   *
   * 404
   * 422
   * ...
   */
  const errorStatus = ref<number | null>(null);

  /*
   * ==========================================================
   * Chapters
   * ==========================================================
   */

  const chapters = computed(() => {
    return courseTree.value?.chapters ?? [];
  });

  /*
   * ==========================================================
   * Material Status
   * ==========================================================
   */

  const hasMaterial = computed(() => {
    return chapters.value.length > 0;
  });

  /*
   * ==========================================================
   * Statistics
   * ==========================================================
   */

  const chapterCount = computed(() => {
    return chapters.value.length;
  });

  const unitCount = computed(() => {
    return chapters.value.reduce((total, chapter) => {
      return total + chapter.units.length;
    }, 0);
  });

  /*
   * 同一張 Knowledge Card
   * 可能掛在多個 Unit。
   *
   * 所以不能直接：
   *
   * sum(unit.knowledge_cards.length)
   *
   * 否則同一張 Card
   * 可能被算兩次。
   *
   * 使用 card.id 去重。
   */
  const knowledgeCardCount = computed(() => {
    const ids = new Set<number>();

    chapters.value.forEach((chapter) => {
      chapter.units.forEach((unit) => {
        unit.knowledge_cards.forEach((card) => {
          ids.add(card.id);
        });
      });
    });

    return ids.size;
  });

  /*
   * ==========================================================
   * Busy
   * ==========================================================
   */

  const isBusy = computed(() => {
    return (
      loading.value ||
      downloadingTemplate.value ||
      importing.value ||
      editing.value ||
      uploadingImage.value
    );
  });

  /*
   * ==========================================================
   * Error Helpers
   * ==========================================================
   */

  function clearErrorMessage() {
    errorMessage.value = '';

    errorStatus.value = null;
  }

  function getValidationMessage(data: ApiErrorResponse): string | null {
    if (!data.errors) {
      return null;
    }

    const values = Object.values(data.errors);

    for (const value of values) {
      if (Array.isArray(value)) {
        const message = value[0];

        if (message) {
          return message;
        }

        continue;
      }

      if (typeof value === 'string' && value.trim()) {
        return value;
      }
    }

    return null;
  }

  function setError(
    error: unknown,

    fallbackMessage: string,
  ) {
    if (isAxiosError(error)) {
      errorStatus.value = error.response?.status ?? null;

      const data = error.response?.data as ApiErrorResponse | undefined;

      if (data) {
        /*
         * Laravel Validation errors
         * 優先顯示。
         */
        const validationMessage = getValidationMessage(data);

        if (validationMessage) {
          errorMessage.value = validationMessage;

          return;
        }

        /*
         * Backend 自訂 message。
         */
        if (data.message?.trim()) {
          errorMessage.value = data.message;

          return;
        }
      }
    }

    errorMessage.value = fallbackMessage;
  }

  /*
   * ==========================================================
   * Course Tree
   * ==========================================================
   */

  async function fetchCourseTree(courseId: number): Promise<boolean> {
    currentCourseId.value = courseId;

    loading.value = true;

    clearErrorMessage();

    try {
      const response = await teacherMaterialApi.getCourseTree(courseId);

      courseTree.value = response.data.course;

      return true;
    } catch (error) {
      /*
       * 取得失敗時，
       * 不保留上一門 Course 的 Tree。
       */
      courseTree.value = null;

      setError(error, '取得教材失敗');

      return false;
    } finally {
      loading.value = false;
    }
  }

  /*
   * CRUD 後重新抓整棵 Tree。
   *
   * 不使用前端手動 splice / push，
   * 原因：
   *
   * Knowledge Card 現在可能同時
   * 關聯多個 Unit。
   *
   * 直接重新讀 Backend Tree
   * 比較不容易發生前後端狀態不同步。
   */
  async function refreshCourseTree(): Promise<boolean> {
    if (currentCourseId.value === null) {
      return false;
    }

    try {
      const response = await teacherMaterialApi.getCourseTree(currentCourseId.value);

      courseTree.value = response.data.course;

      return true;
    } catch (error) {
      setError(error, '教材已更新，但重新載入教材失敗，請重新整理頁面');

      return false;
    }
  }

  /*
   * ==========================================================
   * Download Template
   * ==========================================================
   */

  async function downloadTemplate(): Promise<boolean> {
    downloadingTemplate.value = true;

    clearErrorMessage();

    try {
      const response = await teacherMaterialApi.downloadTemplate();

      const blob = response.data;

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');

      link.href = url;

      /*
       * Backend 實際使用：
       *
       * public/templates/course_template.xlsx
       *
       * 但教師下載看到中文檔名。
       */
      link.download = '教材匯入範本.xlsx';

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      setError(error, '下載教材範本失敗');

      return false;
    } finally {
      downloadingTemplate.value = false;
    }
  }

  /*
   * ==========================================================
   * Import Material
   * ==========================================================
   */

  async function importMaterial(
    courseId: number,

    file: File,

    overwrite = false,
  ): Promise<boolean> {
    importing.value = true;

    clearErrorMessage();

    /*
     * 確保之後 CRUD Refresh
     * 知道目前 Course。
     */
    currentCourseId.value = courseId;

    try {
      await teacherMaterialApi.importMaterial(courseId, {
        file,
        overwrite,
      });

      await refreshCourseTree();

      return true;
    } catch (error) {
      setError(error, overwrite ? '重新匯入教材失敗' : '匯入教材失敗');

      return false;
    } finally {
      importing.value = false;
    }
  }

  /*
   * ==========================================================
   * Chapter
   * ==========================================================
   */

  async function createChapter(courseId: number, data: MaterialNamePayload): Promise<boolean> {
    editing.value = true;

    clearErrorMessage();

    try {
      await teacherMaterialApi.createChapter(courseId, data);

      /*
       * CRUD 成功後，
       * 從 Backend 重新取得 Tree。
       */
      await refreshCourseTree();

      return true;
    } catch (error) {
      setError(error, '新增章節失敗');

      return false;
    } finally {
      editing.value = false;
    }
  }

  async function updateChapter(
    chapterId: number,

    data: MaterialNamePayload,
  ): Promise<boolean> {
    editing.value = true;

    clearErrorMessage();

    try {
      await teacherMaterialApi.updateChapter(chapterId, data);

      await refreshCourseTree();

      return true;
    } catch (error) {
      setError(error, '修改章節失敗');

      return false;
    } finally {
      editing.value = false;
    }
  }

  async function deleteChapter(chapterId: number): Promise<boolean> {
    editing.value = true;

    clearErrorMessage();

    try {
      await teacherMaterialApi.deleteChapter(chapterId);

      await refreshCourseTree();

      return true;
    } catch (error) {
      setError(error, '刪除章節失敗');

      return false;
    } finally {
      editing.value = false;
    }
  }

  /*
   * ==========================================================
   * Unit
   * ==========================================================
   */

  async function createUnit(
    chapterId: number,

    data: MaterialNamePayload,
  ): Promise<boolean> {
    editing.value = true;

    clearErrorMessage();

    try {
      await teacherMaterialApi.createUnit(chapterId, data);

      await refreshCourseTree();

      return true;
    } catch (error) {
      setError(error, '新增單元失敗');

      return false;
    } finally {
      editing.value = false;
    }
  }

  async function updateUnit(
    unitId: number,

    data: MaterialNamePayload,
  ): Promise<boolean> {
    editing.value = true;

    clearErrorMessage();

    try {
      await teacherMaterialApi.updateUnit(unitId, data);

      await refreshCourseTree();

      return true;
    } catch (error) {
      setError(error, '修改單元失敗');

      return false;
    } finally {
      editing.value = false;
    }
  }

  async function deleteUnit(unitId: number): Promise<boolean> {
    editing.value = true;

    clearErrorMessage();

    try {
      await teacherMaterialApi.deleteUnit(unitId);

      await refreshCourseTree();

      return true;
    } catch (error) {
      setError(error, '刪除單元失敗');

      return false;
    } finally {
      editing.value = false;
    }
  }

  /*
   * ==========================================================
   * Knowledge Card
   * ==========================================================
   */

  async function createKnowledgeCard(
    unitId: number,

    data: KnowledgeCardPayload,
  ): Promise<boolean> {
    editing.value = true;

    clearErrorMessage();

    try {
      await teacherMaterialApi.createKnowledgeCard(unitId, data);

      await refreshCourseTree();

      return true;
    } catch (error) {
      setError(error, '新增知識卡失敗');

      return false;
    } finally {
      editing.value = false;
    }
  }

  async function updateKnowledgeCard(
    cardId: number,

    data: KnowledgeCardPayload,
  ): Promise<boolean> {
    editing.value = true;

    clearErrorMessage();

    try {
      await teacherMaterialApi.updateKnowledgeCard(cardId, data);

      /*
       * 一張 Card 可能同時存在
       * 於多個 Unit。
       *
       * 更新後重新取得整棵 Tree，
       * 所有 Unit 裡的相同 Card
       * 都會同步顯示新內容。
       */
      await refreshCourseTree();

      return true;
    } catch (error) {
      setError(error, '修改知識卡失敗');

      return false;
    } finally {
      editing.value = false;
    }
  }

  async function deleteKnowledgeCard(cardId: number): Promise<boolean> {
    editing.value = true;

    clearErrorMessage();

    try {
      await teacherMaterialApi.deleteKnowledgeCard(cardId);

      await refreshCourseTree();

      return true;
    } catch (error) {
      /*
       * 如果 Knowledge Card
       * 已被 Question 使用，
       * Backend 可能回 422。
       *
       * 直接顯示 Backend message。
       */
      setError(error, '刪除知識卡失敗');

      return false;
    } finally {
      editing.value = false;
    }
  }

  /*
   * ==========================================================
   * Find Knowledge Card
   * ==========================================================
   *
   * 因為一張 Card
   * 可以出現在不同 Unit，
   *
   * 未來 Editor / Graph 點 Node 時
   * 可以直接透過 ID 取得 Card。
   */

  function findKnowledgeCard(cardId: number): MaterialKnowledgeCardNode | null {
    for (const chapter of chapters.value) {
      for (const unit of chapter.units) {
        const card = unit.knowledge_cards.find((item) => item.id === cardId);

        if (card) {
          return card;
        }
      }
    }

    return null;
  }

  /*
   * ==========================================================
   * Editor Image Upload
   * ==========================================================
   *
   * Backend：
   *
   * POST /teacher/upload-image
   *
   * multipart:
   *
   * image
   *
   * 最大 5 MB。
   *
   * 成功：
   *
   * {
   *   url: "..."
   * }
   *
   * 之後 RichTextEditor
   * 使用這個 URL 插入 <img>。
   */

  async function uploadEditorImage(image: File): Promise<string | null> {
    clearErrorMessage();

    /*
     * Frontend 先做基本檢查。
     */
    if (!image.type.startsWith('image/')) {
      errorMessage.value = '請選擇圖片檔案';

      return null;
    }

    const maxSize = 5 * 1024 * 1024;

    if (image.size > maxSize) {
      errorMessage.value = '圖片大小不可超過 5MB';

      return null;
    }

    uploadingImage.value = true;

    try {
      const response = await teacherMaterialApi.uploadEditorImage(image);

      return response.data.url ?? null;
    } catch (error) {
      setError(error, '圖片上傳失敗');

      return null;
    } finally {
      uploadingImage.value = false;
    }
  }

  /*
   * ==========================================================
   * Clear
   * ==========================================================
   *
   * 離開 Course Page
   * 或 Route 變成無效 ID 時使用。
   */

  function clearMaterial() {
    currentCourseId.value = null;

    courseTree.value = null;

    clearErrorMessage();
  }

  /*
   * ==========================================================
   * Return
   * ==========================================================
   */

  return {
    /*
     * Current Course
     */
    currentCourseId,

    /*
     * Tree
     */
    courseTree,

    chapters,

    /*
     * Summary
     */
    hasMaterial,

    chapterCount,

    unitCount,

    knowledgeCardCount,

    /*
     * Loading
     */
    loading,

    downloadingTemplate,

    importing,

    editing,

    uploadingImage,

    isBusy,

    /*
     * Error
     */
    errorMessage,

    errorStatus,

    clearErrorMessage,

    /*
     * Tree
     */
    fetchCourseTree,

    refreshCourseTree,

    /*
     * Template / Import
     */
    downloadTemplate,

    importMaterial,

    /*
     * Chapter
     */
    createChapter,

    updateChapter,

    deleteChapter,

    /*
     * Unit
     */
    createUnit,

    updateUnit,

    deleteUnit,

    /*
     * Knowledge Card
     */
    createKnowledgeCard,

    updateKnowledgeCard,

    deleteKnowledgeCard,

    findKnowledgeCard,

    /*
     * Editor Image
     */
    uploadEditorImage,

    /*
     * Clear
     */
    clearMaterial,
  };
}
