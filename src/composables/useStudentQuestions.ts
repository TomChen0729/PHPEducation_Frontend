import { computed, ref } from 'vue';

import { AxiosError } from 'axios';

import { studentQuestionApi } from '../api/student-question.api';

import type {
  StudentQuestion,
  StudentQuestionSubmitRequest,
  StudentQuestionSubmitResponse,
} from '../types/student-question';

/*
 * ============================================================
 * Student Questions Composable
 * ============================================================
 *
 * 負責：
 *
 * 1. 取得課程題目列表
 * 2. 取得單一題目
 * 3. 提交學生答案
 * 4. Loading 狀態
 * 5. Error 狀態
 * 6. Submit Result
 */

export function useStudentQuestions() {
  /*
   * ==========================================================
   * State
   * ==========================================================
   */

  /*
   * 課程題目列表
   */
  const questions = ref<StudentQuestion[]>([]);

  /*
   * 目前正在作答的單一題目
   */
  const selectedQuestion = ref<StudentQuestion | null>(null);

  /*
   * 送出答案後的結果
   */
  const submitResult = ref<StudentQuestionSubmitResponse | null>(null);

  /*
   * ==========================================================
   * Loading
   * ==========================================================
   */

  /*
   * 題目列表 Loading
   */
  const loading = ref(false);

  /*
   * 單一題目 Loading
   */
  const questionLoading = ref(false);

  /*
   * 送出答案 Loading
   */
  const submitLoading = ref(false);

  /*
   * ==========================================================
   * Error
   * ==========================================================
   */

  const errorMessage = ref('');

  /*
   * ==========================================================
   * Computed
   * ==========================================================
   */

  /*
   * 是否完全沒有題目
   */
  const isEmpty = computed(() => !loading.value && questions.value.length === 0);

  /*
   * 題目總數
   */
  const questionCount = computed(() => questions.value.length);

  /*
   * 是否已有 Submit Result
   */
  const hasSubmitResult = computed(() => submitResult.value !== null);

  /*
   * ==========================================================
   * Load Questions
   * ==========================================================
   *
   * GET
   *
   * /student/courses/{courseId}/questions
   *
   * optional:
   *
   * ?knowledge_card_id={id}
   */

  async function loadQuestions(courseId: number, knowledgeCardId?: number) {
    loading.value = true;

    errorMessage.value = '';

    try {
      const response = await studentQuestionApi.getQuestions(courseId, knowledgeCardId);

      questions.value = response.data.questions ?? [];

      return questions.value;
    } catch (error) {
      questions.value = [];

      errorMessage.value = getErrorMessage(error, '取得題目失敗，請稍後再試。');

      return null;
    } finally {
      loading.value = false;
    }
  }

  /*
   * ==========================================================
   * Load Single Question
   * ==========================================================
   *
   * GET
   *
   * /student/questions/{questionId}
   */

  async function loadQuestion(questionId: number) {
    questionLoading.value = true;

    errorMessage.value = '';

    /*
     * 換新題目時，
     * 先清除上一題的 Submit Result。
     */
    submitResult.value = null;

    try {
      const response = await studentQuestionApi.getQuestion(questionId);

      selectedQuestion.value = response.data.question;

      return selectedQuestion.value;
    } catch (error) {
      selectedQuestion.value = null;

      errorMessage.value = getErrorMessage(error, '取得題目內容失敗，請稍後再試。');

      return null;
    } finally {
      questionLoading.value = false;
    }
  }

  /*
   * ==========================================================
   * Submit Answer
   * ==========================================================
   *
   * POST
   *
   * /student/questions/{questionId}/submit
   */

  async function submitAnswer(questionId: number, data: StudentQuestionSubmitRequest) {
    submitLoading.value = true;

    errorMessage.value = '';

    /*
     * 避免保留上一筆結果
     */
    submitResult.value = null;

    try {
      const response = await studentQuestionApi.submitQuestion(questionId, data);

      submitResult.value = response.data;

      return submitResult.value;
    } catch (error) {
      errorMessage.value = getErrorMessage(error, '送出答案失敗，請稍後再試。');

      return null;
    } finally {
      submitLoading.value = false;
    }
  }

  /*
   * ==========================================================
   * Select Question From List
   * ==========================================================
   *
   * 題目列表本身已經有 Question 資料時，
   * 可以先設定 selectedQuestion。
   *
   * 正式進入作答頁後，
   * 還是可以再呼叫 loadQuestion()
   * 取得 Backend 最新完整資料。
   */

  function selectQuestion(question: StudentQuestion) {
    selectedQuestion.value = question;

    submitResult.value = null;

    errorMessage.value = '';
  }

  /*
   * ==========================================================
   * Clear Selected Question
   * ==========================================================
   */

  function clearSelectedQuestion() {
    selectedQuestion.value = null;

    submitResult.value = null;

    errorMessage.value = '';
  }

  /*
   * ==========================================================
   * Clear Submit Result
   * ==========================================================
   */

  function clearSubmitResult() {
    submitResult.value = null;
  }

  /*
   * ==========================================================
   * Clear Error
   * ==========================================================
   */

  function clearError() {
    errorMessage.value = '';
  }

  /*
   * ==========================================================
   * Error Parser
   * ==========================================================
   */

  function getErrorMessage(error: unknown, fallback: string): string {
    /*
     * Axios Error
     */
    if (error instanceof AxiosError) {
      const data = error.response?.data as
        | {
            message?: string;
            error?: string;
          }
        | undefined;

      if (data?.message) {
        return data.message;
      }

      if (data?.error) {
        return data.error;
      }
    }

    /*
     * Native Error
     */
    if (error instanceof Error && error.message) {
      return error.message;
    }

    return fallback;
  }

  /*
   * ==========================================================
   * Return
   * ==========================================================
   */

  return {
    /*
     * State
     */
    questions,

    selectedQuestion,

    submitResult,

    /*
     * Loading
     */
    loading,

    questionLoading,

    submitLoading,

    /*
     * Error
     */
    errorMessage,

    /*
     * Computed
     */
    isEmpty,

    questionCount,

    hasSubmitResult,

    /*
     * Methods
     */
    loadQuestions,

    loadQuestion,

    submitAnswer,

    selectQuestion,

    clearSelectedQuestion,

    clearSubmitResult,

    clearError,
  };
}
