import { computed, ref } from 'vue';

import axios from 'axios';

import { teacherQuestionRecordApi } from '../api/teacher-question-record.api';

import { teacherQuestionApi } from '../api/teacher-question.api';

import type { TeacherBloom, TeacherQuestion, TeacherQuestionType } from '../types/teacher-question';

import type {
  TeacherQuestionRecord,
  TeacherQuestionRecordReviewRequest,
  TeacherQuestionRecordStatus,
} from '../types/teacher-question-record';

export type TeacherQuestionRecordTypeFilter = 'all' | TeacherQuestionType;

export type TeacherQuestionRecordStatusFilter = 'all' | TeacherQuestionRecordStatus;

export function useTeacherQuestionRecords() {
  /*
   * ============================================================
   * State
   * ============================================================
   */
  const records = ref<TeacherQuestionRecord[]>([]);

  const blooms = ref<TeacherBloom[]>([]);

  const selectedQuestion = ref<TeacherQuestion | null>(null);

  const loading = ref(false);

  const questionLoading = ref(false);

  const reviewingRecordId = ref<number | null>(null);

  const errorMessage = ref('');

  const detailErrorMessage = ref('');

  /*
   * ============================================================
   * Filters
   * ============================================================
   */
  const searchKeyword = ref('');

  const typeFilter = ref<TeacherQuestionRecordTypeFilter>('all');

  const statusFilter = ref<TeacherQuestionRecordStatusFilter>('all');

  const filteredRecords = computed(() => {
    const keyword = searchKeyword.value.trim().toLowerCase();

    return records.value.filter((record) => {
      const matchesType = typeFilter.value === 'all' || record.question_type === typeFilter.value;

      const matchesStatus =
        statusFilter.value === 'all' || record.teacher_status === statusFilter.value;

      if (!matchesType || !matchesStatus) {
        return false;
      }

      if (!keyword) {
        return true;
      }

      return [
        record.student_name,
        record.student_no,
        record.question_title,
        record.question_type,
        record.question_bloom_id,
        record.bloom_id,
      ]
        .filter((value): value is string => typeof value === 'string')
        .some((value) => value.toLowerCase().includes(keyword));
    });
  });

  const pendingReviewCount = computed(() => {
    return records.value.filter((record) => record.teacher_status === 'pending').length;
  });

  /*
   * ============================================================
   * Init
   * ============================================================
   */
  async function fetchRecordData(courseId: number): Promise<boolean> {
    loading.value = true;

    errorMessage.value = '';

    try {
      const [recordResponse, bloomResponse] = await Promise.all([
        teacherQuestionRecordApi.getRecords(courseId),
        teacherQuestionApi.getBlooms(),
      ]);

      records.value = recordResponse.data.records;

      blooms.value = bloomResponse.data.blooms;

      return true;
    } catch (error: unknown) {
      errorMessage.value = getApiErrorMessage(error, '作答紀錄取得失敗');

      records.value = [];

      return false;
    } finally {
      loading.value = false;
    }
  }

  async function refreshRecords(courseId: number): Promise<boolean> {
    loading.value = true;

    errorMessage.value = '';

    try {
      const response = await teacherQuestionRecordApi.getRecords(courseId);

      records.value = response.data.records;

      return true;
    } catch (error: unknown) {
      errorMessage.value = getApiErrorMessage(error, '作答紀錄重新整理失敗');

      return false;
    } finally {
      loading.value = false;
    }
  }

  /*
   * ============================================================
   * Question Detail
   * ============================================================
   */
  async function fetchQuestionDetail(questionId: number): Promise<TeacherQuestion | null> {
    questionLoading.value = true;

    detailErrorMessage.value = '';

    selectedQuestion.value = null;

    try {
      const response = await teacherQuestionApi.getQuestion(questionId);

      selectedQuestion.value = response.data.question;

      return response.data.question;
    } catch (error: unknown) {
      detailErrorMessage.value = getApiErrorMessage(error, '題目內容取得失敗');

      return null;
    } finally {
      questionLoading.value = false;
    }
  }

  function clearQuestionDetail() {
    selectedQuestion.value = null;

    detailErrorMessage.value = '';
  }

  /*
   * ============================================================
   * Review
   * ============================================================
   */
  async function reviewRecord(
    recordId: number,

    data: TeacherQuestionRecordReviewRequest,
  ): Promise<TeacherQuestionRecord | null> {
    reviewingRecordId.value = recordId;

    detailErrorMessage.value = '';

    try {
      const response = await teacherQuestionRecordApi.reviewRecord(recordId, data);

      const updatedRecord = response.data.record;

      const index = records.value.findIndex((record) => record.id === recordId);

      if (index >= 0) {
        records.value[index] = updatedRecord;
      }

      return updatedRecord;
    } catch (error: unknown) {
      detailErrorMessage.value = getApiErrorMessage(error, '作答覆核失敗');

      return null;
    } finally {
      reviewingRecordId.value = null;
    }
  }

  /*
   * ============================================================
   * Filters
   * ============================================================
   */
  function setSearchKeyword(value: string) {
    searchKeyword.value = value;
  }

  function setTypeFilter(value: TeacherQuestionRecordTypeFilter) {
    typeFilter.value = value;
  }

  function setStatusFilter(value: TeacherQuestionRecordStatusFilter) {
    statusFilter.value = value;
  }

  /*
   * ============================================================
   * Clear
   * ============================================================
   */
  function clearRecords() {
    records.value = [];

    blooms.value = [];

    selectedQuestion.value = null;

    searchKeyword.value = '';

    typeFilter.value = 'all';

    statusFilter.value = 'all';

    errorMessage.value = '';

    detailErrorMessage.value = '';
  }

  function clearErrorMessage() {
    errorMessage.value = '';
  }

  function clearDetailErrorMessage() {
    detailErrorMessage.value = '';
  }

  return {
    records,
    blooms,
    selectedQuestion,

    filteredRecords,
    pendingReviewCount,

    searchKeyword,
    typeFilter,
    statusFilter,

    loading,
    questionLoading,
    reviewingRecordId,

    errorMessage,
    detailErrorMessage,

    fetchRecordData,
    refreshRecords,
    fetchQuestionDetail,
    reviewRecord,

    setSearchKeyword,
    setTypeFilter,
    setStatusFilter,

    clearQuestionDetail,
    clearRecords,
    clearErrorMessage,
    clearDetailErrorMessage,
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
