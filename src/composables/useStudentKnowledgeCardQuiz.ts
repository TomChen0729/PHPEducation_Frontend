import { computed, ref } from 'vue';

import { AxiosError } from 'axios';

import { studentQuestionApi } from '../api/student-question.api';

import type {
  StudentKnowledgeCardQuizResponse,
  StudentKnowledgeCardQuizSubmitResponse,
  StudentQuestionSubmitRequest,
} from '../types/student-question';

export function useStudentKnowledgeCardQuiz() {
  const quiz = ref<StudentKnowledgeCardQuizResponse | null>(null);
  const loading = ref(false);
  const submittingQuestionId = ref<number | null>(null);
  const errorMessage = ref('');
  const latestResults = ref<Record<number, StudentKnowledgeCardQuizSubmitResponse>>({});

  const answeredCount = computed(() => {
    if (!quiz.value) {
      return 0;
    }

    return quiz.value.questions.filter((question) => question.answered).length;
  });

  const questionCount = computed(() => quiz.value?.question_count ?? 0);

  async function loadQuiz(courseId: number, cardId: number) {
    loading.value = true;
    errorMessage.value = '';
    latestResults.value = {};

    try {
      const response = await studentQuestionApi.getKnowledgeCardQuiz(courseId, cardId);
      quiz.value = response.data;

      return quiz.value;
    } catch (error) {
      quiz.value = null;
      errorMessage.value = getErrorMessage(error, '取得小試身手題目失敗，請稍後再試。');
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function submitQuizAnswer(
    courseId: number,
    cardId: number,
    questionId: number,
    data: StudentQuestionSubmitRequest,
  ) {
    submittingQuestionId.value = questionId;
    errorMessage.value = '';

    try {
      const response = await studentQuestionApi.submitKnowledgeCardQuizQuestion(
        courseId,
        cardId,
        questionId,
        data,
      );

      latestResults.value = {
        ...latestResults.value,
        [questionId]: response.data,
      };

      if (quiz.value) {
        quiz.value = {
          ...quiz.value,
          completed: response.data.completed,
          completed_at: response.data.completed_at,
          questions: quiz.value.questions.map((question) =>
            question.id === questionId
              ? {
                  ...question,
                  ...response.data.question_status,
                }
              : question,
          ),
        };
      }

      return response.data;
    } catch (error) {
      errorMessage.value = getErrorMessage(error, '送出答案失敗，請稍後再試。');
      return null;
    } finally {
      submittingQuestionId.value = null;
    }
  }

  function resultFor(questionId: number) {
    return latestResults.value[questionId] ?? null;
  }

  function clearQuiz() {
    quiz.value = null;
    latestResults.value = {};
    errorMessage.value = '';
  }

  return {
    quiz,
    loading,
    submittingQuestionId,
    errorMessage,
    latestResults,
    answeredCount,
    questionCount,
    loadQuiz,
    submitQuizAnswer,
    resultFor,
    clearQuiz,
  };
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as
      | {
          message?: string;
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
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}
