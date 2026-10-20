import { computed, ref } from 'vue';

import axios from 'axios';

import { teacherStatsApi } from '../api/teacher-stats.api';

import type {
  TeacherStatsStudent,
  TeacherStatsTableResponse,
  TeacherStudentSoloStatsResponse,
} from '../types/teacher-stats';

export function useTeacherStats() {
  const bloomStats = ref<TeacherStatsTableResponse | null>(null);
  const soloStats = ref<TeacherStatsTableResponse | null>(null);
  const studentSoloStats = ref<TeacherStudentSoloStatsResponse | null>(null);

  const loadingMaterial = ref(false);
  const loadingStudent = ref(false);
  const errorMessage = ref('');

  const students = computed<TeacherStatsStudent[]>(() => studentSoloStats.value?.students ?? []);

  async function loadMaterialStats(courseId: number): Promise<boolean> {
    loadingMaterial.value = true;
    errorMessage.value = '';

    try {
      const [bloomResponse, soloResponse] = await Promise.all([
        teacherStatsApi.getBloom(courseId),
        teacherStatsApi.getSolo(courseId),
      ]);

      bloomStats.value = bloomResponse.data;
      soloStats.value = soloResponse.data;

      return true;
    } catch (error: unknown) {
      bloomStats.value = null;
      soloStats.value = null;
      errorMessage.value = getApiErrorMessage(error, '教材統計取得失敗，請稍後再試。');
      return false;
    } finally {
      loadingMaterial.value = false;
    }
  }

  async function loadStudentSolo(
    courseId: number,
    studentId: number | null = null,
  ): Promise<boolean> {
    loadingStudent.value = true;
    errorMessage.value = '';

    try {
      const response = await teacherStatsApi.getStudentSolo(courseId, studentId);
      studentSoloStats.value = response.data;
      return true;
    } catch (error: unknown) {
      errorMessage.value = getApiErrorMessage(error, '學生 SOLO 統計取得失敗，請稍後再試。');
      return false;
    } finally {
      loadingStudent.value = false;
    }
  }

  function clearStats() {
    bloomStats.value = null;
    soloStats.value = null;
    studentSoloStats.value = null;
    errorMessage.value = '';
  }

  return {
    bloomStats,
    soloStats,
    studentSoloStats,
    students,
    loadingMaterial,
    loadingStudent,
    errorMessage,
    loadMaterialStats,
    loadStudentSolo,
    clearStats,
  };
}

function getApiErrorMessage(error: unknown, fallback: string): string {
  if (!axios.isAxiosError(error)) {
    return fallback;
  }

  if (error.response?.status === 404) {
    return '找不到此課程、學生，或你沒有查看這筆統計的權限。';
  }

  if (error.response?.status === 403) {
    return '你沒有查看此課程統計的權限。';
  }

  const data = error.response?.data as
    | {
        message?: string;
      }
    | undefined;

  return data?.message ?? fallback;
}
