import { computed, ref } from 'vue';

import axios from 'axios';

import { teacherQuestionApi } from '../api/teacher-question.api';

import type {
  TeacherBloom,
  TeacherQuestion,
  TeacherQuestionKnowledgeCardOption,
  TeacherQuestionRequest,
  TeacherQuestionType,
} from '../types/teacher-question';

/*
 * ============================================================
 * Filter
 * ============================================================
 */

export type TeacherQuestionTypeFilter = 'all' | TeacherQuestionType;

export function useTeacherQuestions() {
  /*
   * ==========================================================
   * Data
   * ==========================================================
   */

  const questions = ref<TeacherQuestion[]>([]);

  const blooms = ref<TeacherBloom[]>([]);

  const knowledgeCards = ref<TeacherQuestionKnowledgeCardOption[]>([]);

  /*
   * ==========================================================
   * Filter
   * ==========================================================
   */

  const searchKeyword = ref('');

  const typeFilter = ref<TeacherQuestionTypeFilter>('all');

  /*
   * ==========================================================
   * Loading
   * ==========================================================
   */

  const loading = ref(false);

  const saving = ref(false);

  const deletingQuestionId = ref<number | null>(null);

  /*
   * ==========================================================
   * Error
   * ==========================================================
   */

  const errorMessage = ref('');

  /*
   * ==========================================================
   * Filtered Questions
   * ==========================================================
   */

  const filteredQuestions = computed(() => {
    const keyword = searchKeyword.value.trim().toLowerCase();

    return questions.value.filter((question) => {
      /*
       * Question Type
       */
      const typeMatched = typeFilter.value === 'all' || question.type === typeFilter.value;

      if (!typeMatched) {
        return false;
      }

      /*
       * Search
       */
      if (!keyword) {
        return true;
      }

      const cardText = question.knowledge_cards.map((card) => card.title).join(' ');

      const searchableText = [
        question.title,

        question.question_content,

        question.bloom_id ?? '',

        cardText,
      ]
        .join(' ')
        .toLowerCase();

      return searchableText.includes(keyword);
    });
  });

  /*
   * ==========================================================
   * Initial Data
   * ==========================================================
   */

  async function fetchQuestionData(courseId: number): Promise<boolean> {
    loading.value = true;

    errorMessage.value = '';

    try {
      const [questionResponse, bloomResponse, knowledgeCardResponse] = await Promise.all([
        teacherQuestionApi.getQuestions(courseId),

        teacherQuestionApi.getBlooms(),

        teacherQuestionApi.getKnowledgeCards(courseId),
      ]);

      questions.value = questionResponse.data.questions;

      blooms.value = bloomResponse.data.blooms;

      knowledgeCards.value = knowledgeCardResponse.data.knowledge_cards;

      return true;
    } catch (error: unknown) {
      errorMessage.value = getApiErrorMessage(error, '題庫資料取得失敗');

      questions.value = [];

      blooms.value = [];

      knowledgeCards.value = [];

      return false;
    } finally {
      loading.value = false;
    }
  }

  /*
   * ==========================================================
   * Refresh Questions
   * ==========================================================
   */

  async function fetchQuestions(courseId: number): Promise<boolean> {
    try {
      const response = await teacherQuestionApi.getQuestions(courseId);

      questions.value = response.data.questions;

      return true;
    } catch (error: unknown) {
      errorMessage.value = getApiErrorMessage(error, '題目取得失敗');

      return false;
    }
  }

  /*
   * ==========================================================
   * Create
   * ==========================================================
   */

  async function createQuestion(
    courseId: number,

    data: TeacherQuestionRequest,
  ): Promise<boolean> {
    saving.value = true;

    errorMessage.value = '';

    try {
      await teacherQuestionApi.createQuestion(courseId, data);

      await fetchQuestions(courseId);

      return true;
    } catch (error: unknown) {
      errorMessage.value = getApiErrorMessage(error, '題目新增失敗');

      return false;
    } finally {
      saving.value = false;
    }
  }

  /*
   * ==========================================================
   * Update
   * ==========================================================
   */

  async function updateQuestion(
    courseId: number,

    questionId: number,

    data: TeacherQuestionRequest,
  ): Promise<boolean> {
    saving.value = true;

    errorMessage.value = '';

    try {
      await teacherQuestionApi.updateQuestion(questionId, data);

      await fetchQuestions(courseId);

      return true;
    } catch (error: unknown) {
      errorMessage.value = getApiErrorMessage(error, '題目修改失敗');

      return false;
    } finally {
      saving.value = false;
    }
  }

  /*
   * ==========================================================
   * Delete
   * ==========================================================
   */

  async function deleteQuestion(
    courseId: number,

    questionId: number,
  ): Promise<boolean> {
    deletingQuestionId.value = questionId;

    errorMessage.value = '';

    try {
      await teacherQuestionApi.deleteQuestion(questionId);

      await fetchQuestions(courseId);

      return true;
    } catch (error: unknown) {
      errorMessage.value = getApiErrorMessage(error, '題目刪除失敗');

      return false;
    } finally {
      deletingQuestionId.value = null;
    }
  }

  /*
   * ==========================================================
   * Filter
   * ==========================================================
   */

  function setSearchKeyword(value: string) {
    searchKeyword.value = value;
  }

  function setTypeFilter(value: TeacherQuestionTypeFilter) {
    typeFilter.value = value;
  }

  /*
   * ==========================================================
   * Clear
   * ==========================================================
   */

  function clearErrorMessage() {
    errorMessage.value = '';
  }

  function clearQuestions() {
    questions.value = [];

    searchKeyword.value = '';

    typeFilter.value = 'all';

    errorMessage.value = '';
  }

  return {
    /*
     * Data
     */
    questions,

    blooms,

    knowledgeCards,

    filteredQuestions,

    /*
     * Filters
     */
    searchKeyword,

    typeFilter,

    /*
     * Status
     */
    loading,

    saving,

    deletingQuestionId,

    errorMessage,

    /*
     * Actions
     */
    fetchQuestionData,

    fetchQuestions,

    createQuestion,

    updateQuestion,

    deleteQuestion,

    setSearchKeyword,

    setTypeFilter,

    clearErrorMessage,

    clearQuestions,
  };
}

/*
 * ============================================================
 * Error Helper
 * ============================================================
 */

function getApiErrorMessage(
  error: unknown,

  fallback: string,
): string {
  if (!axios.isAxiosError(error)) {
    return fallback;
  }

  const data = error.response?.data as
    | {
        message?: string;

        errors?: Record<string, string[]>;
      }
    | undefined;

  /*
   * Laravel Validation Error
   */
  if (data?.errors) {
    const firstError = Object.values(data.errors).flat()[0];

    if (firstError) {
      return firstError;
    }
  }

  /*
   * General Backend Message
   */
  if (data?.message) {
    return data.message;
  }

  /*
   * Status
   */
  if (error.response?.status === 404) {
    return '找不到此課程或題目';
  }

  if (error.response?.status === 403) {
    return '你沒有操作此題庫的權限';
  }

  return fallback;
}
