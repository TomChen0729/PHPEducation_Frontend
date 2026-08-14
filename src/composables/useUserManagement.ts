import { ref } from 'vue';
import axios from 'axios';

import { teacherApplicationApi } from '../api/teacher-application.api';

import type {
  TeacherAccountResult,
  TeacherApplicationErrorResponse,
} from '../types/teacher-application';

export function useUserManagement() {
  const approveLoading = ref(false);
  const errorMessage = ref('');

  async function approveTeacherApplication(
    applicationId: number,
  ): Promise<TeacherAccountResult | null> {
    approveLoading.value = true;
    errorMessage.value = '';

    try {
      const response = await teacherApplicationApi.approve(applicationId);

      return response.data.data;
    } catch (error: unknown) {
      if (axios.isAxiosError<TeacherApplicationErrorResponse>(error)) {
        errorMessage.value = error.response?.data.message ?? '教師帳號核准失敗';
      } else {
        errorMessage.value = '教師帳號核准失敗';
      }

      return null;
    } finally {
      approveLoading.value = false;
    }
  }

  return {
    approveLoading,
    errorMessage,
    approveTeacherApplication,
  };
}
