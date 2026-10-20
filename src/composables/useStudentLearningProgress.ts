import { computed, ref } from 'vue';

import axios from 'axios';

import { studentLearningApi } from '../api/student-learning.api';

import type {
  StudentLearningProgress,
  StudentLearningProgressCard,
} from '../types/student-learning';

export function useStudentLearningProgress() {
  const progress = ref<StudentLearningProgress>();
  const loading = ref(false);
  const readingCardId = ref<number | null>(null);
  const errorMessage = ref('');

  const progressPercent = computed(() => {
    const current = progress.value;

    if (!current || current.total <= 0) {
      return 0;
    }

    return Math.round((current.completed / current.total) * 100);
  });

  const cardProgressMap = computed(() => {
    const map = new Map<number, StudentLearningProgressCard>();

    for (const chapter of progress.value?.chapters ?? []) {
      for (const unit of chapter.units) {
        for (const card of unit.knowledge_cards) {
          map.set(card.id, card);
        }
      }
    }

    return map;
  });

  async function fetchProgress(courseId: number): Promise<boolean> {
    loading.value = true;
    errorMessage.value = '';

    try {
      const response = await studentLearningApi.getProgress(courseId);
      progress.value = response.data.progress;
      return true;
    } catch (error: unknown) {
      progress.value = undefined;
      errorMessage.value = getApiErrorMessage(error, '學習進度取得失敗');
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function markCardRead(courseId: number, cardId: number): Promise<boolean> {
    readingCardId.value = cardId;
    errorMessage.value = '';

    try {
      await studentLearningApi.markKnowledgeCardRead(courseId, cardId);

      const response = await studentLearningApi.getProgress(courseId);
      progress.value = response.data.progress;

      return true;
    } catch (error: unknown) {
      errorMessage.value = getApiErrorMessage(error, '知識卡完成狀態更新失敗');
      return false;
    } finally {
      readingCardId.value = null;
    }
  }

  function clearProgress() {
    progress.value = undefined;
    readingCardId.value = null;
    errorMessage.value = '';
  }

  return {
    progress,
    loading,
    readingCardId,
    errorMessage,
    progressPercent,
    cardProgressMap,
    fetchProgress,
    markCardRead,
    clearProgress,
  };
}

function getApiErrorMessage(error: unknown, fallback: string): string {
  if (!axios.isAxiosError(error)) {
    return fallback;
  }

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

  if (error.response?.status === 404) {
    return '找不到課程、知識卡，或目前沒有存取權限';
  }

  return fallback;
}
