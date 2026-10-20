import { computed, ref } from 'vue';

import { AxiosError } from 'axios';

import { studentQuestionApi } from '../api/student-question.api';

import type {
  StudentQuestion,
  StudentQuestionFilters,
  StudentQuestionRecord,
  StudentQuestionStructureChapter,
  StudentQuestionSubmitRequest,
  StudentQuestionSubmitResponse,
} from '../types/student-question';

export function useStudentQuestions() {
  const questions = ref<StudentQuestion[]>([]);
  const questionStructure = ref<StudentQuestionStructureChapter[]>([]);
  const questionMeta = ref<{ total?: number } | null>(null);

  const selectedQuestion = ref<StudentQuestion | null>(null);
  const selectedRecord = ref<StudentQuestionRecord | null>(null);
  const submitResult = ref<StudentQuestionSubmitResponse | null>(null);

  const loading = ref(false);
  const questionLoading = ref(false);
  const submitLoading = ref(false);

  const errorMessage = ref('');

  const isEmpty = computed(() => !loading.value && questions.value.length === 0);
  const questionCount = computed(() => questionMeta.value?.total ?? questions.value.length);
  const hasSubmitResult = computed(() => submitResult.value !== null);

  async function loadQuestions(courseId: number, filters: StudentQuestionFilters = {}) {
    loading.value = true;
    errorMessage.value = '';

    try {
      const response = await studentQuestionApi.getQuestions(courseId, filters);

      questions.value = response.data.questions ?? [];
      questionStructure.value = response.data.chapters ?? [];
      questionMeta.value = response.data.meta ?? null;

      return questions.value;
    } catch (error) {
      questions.value = [];
      questionStructure.value = [];
      questionMeta.value = null;
      errorMessage.value = getErrorMessage(error, '取得題目失敗，請稍後再試。');

      return null;
    } finally {
      loading.value = false;
    }
  }

  async function loadQuestion(questionId: number) {
    questionLoading.value = true;
    errorMessage.value = '';
    submitResult.value = null;
    selectedRecord.value = null;

    try {
      const response = await studentQuestionApi.getQuestion(questionId);

      selectedQuestion.value = response.data.question;

      const recordId = selectedQuestion.value.practice?.record_id;
      if (recordId) {
        try {
          const recordResponse = await studentQuestionApi.getQuestionRecord(recordId);
          selectedRecord.value = recordResponse.data.record;
        } catch {
          /*
           * 單題本身已包含 practice/review。
           * 額外取得 record 只是為了補 SOLO；失敗不阻斷題目顯示。
           */
          selectedRecord.value = null;
        }
      }

      return selectedQuestion.value;
    } catch (error) {
      selectedQuestion.value = null;
      selectedRecord.value = null;
      errorMessage.value = getErrorMessage(error, '取得題目內容失敗，請稍後再試。');

      return null;
    } finally {
      questionLoading.value = false;
    }
  }

  async function submitAnswer(questionId: number, data: StudentQuestionSubmitRequest) {
    submitLoading.value = true;
    errorMessage.value = '';
    submitResult.value = null;

    try {
      const response = await studentQuestionApi.submitQuestion(questionId, data);

      submitResult.value = response.data;
      selectedRecord.value = response.data.record;

      if (selectedQuestion.value?.id === questionId) {
        selectedQuestion.value = {
          ...selectedQuestion.value,
          practice: {
            record_id: response.data.record.id,
            status: response.data.system_status,
            answered_at: new Date().toISOString(),
            ...(response.data.review !== undefined ? { review: response.data.review } : {}),
          },
        };
      }

      return submitResult.value;
    } catch (error) {
      errorMessage.value = getErrorMessage(error, '送出答案失敗，請稍後再試。');

      return null;
    } finally {
      submitLoading.value = false;
    }
  }

  function selectQuestion(question: StudentQuestion) {
    selectedQuestion.value = question;
    selectedRecord.value = null;
    submitResult.value = null;
    errorMessage.value = '';
  }

  function clearSelectedQuestion() {
    selectedQuestion.value = null;
    selectedRecord.value = null;
    submitResult.value = null;
    errorMessage.value = '';
  }

  function clearSubmitResult() {
    submitResult.value = null;
  }

  function clearError() {
    errorMessage.value = '';
  }

  function getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof AxiosError) {
      const data = error.response?.data as
        | {
            message?: string;
            error?: string;
            errors?: Record<string, string[] | string>;
          }
        | undefined;

      if (data?.message) {
        return data.message;
      }

      if (data?.errors) {
        const first = Object.values(data.errors)[0];
        if (Array.isArray(first) && first[0]) {
          return first[0];
        }
        if (typeof first === 'string') {
          return first;
        }
      }

      if (data?.error) {
        return data.error;
      }
    }

    if (error instanceof Error && error.message) {
      return error.message;
    }

    return fallback;
  }

  return {
    questions,
    questionStructure,
    questionMeta,
    selectedQuestion,
    selectedRecord,
    submitResult,
    loading,
    questionLoading,
    submitLoading,
    errorMessage,
    isEmpty,
    questionCount,
    hasSubmitResult,
    loadQuestions,
    loadQuestion,
    submitAnswer,
    selectQuestion,
    clearSelectedQuestion,
    clearSubmitResult,
    clearError,
  };
}
