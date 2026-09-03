import { computed, ref } from 'vue';

import axios from 'axios';

import { studentMaterialApi } from '../api/student-material.api';

import type { MaterialCourseTree } from '../types/material';

export function useStudentMaterial() {
  const courseTree = ref<MaterialCourseTree | null>(null);

  const loading = ref(false);

  const errorMessage = ref('');

  const hasMaterial = computed(() => {
    return Boolean(courseTree.value && courseTree.value.chapters.length > 0);
  });

  async function fetchMaterial(courseId: number): Promise<boolean> {
    loading.value = true;

    errorMessage.value = '';

    try {
      const response = await studentMaterialApi.getGraph(courseId);

      courseTree.value = response.data.graph;

      return true;
    } catch (error: unknown) {
      courseTree.value = null;

      errorMessage.value = getApiErrorMessage(error, '教材取得失敗');

      return false;
    } finally {
      loading.value = false;
    }
  }

  function clearMaterial() {
    courseTree.value = null;

    errorMessage.value = '';
  }

  return {
    courseTree,

    loading,

    hasMaterial,

    errorMessage,

    fetchMaterial,

    clearMaterial,
  };
}

function getApiErrorMessage(
  error: unknown,

  fallback: string,
): string {
  if (!axios.isAxiosError(error)) {
    return fallback;
  }

  if (error.response?.status === 404) {
    return '找不到此課程，或你目前沒有此課程的修課權限';
  }

  if (error.response?.status === 403) {
    return '你沒有查看此教材的權限';
  }

  const data = error.response?.data as
    | {
        message?: string;
      }
    | undefined;

  return data?.message ?? fallback;
}
