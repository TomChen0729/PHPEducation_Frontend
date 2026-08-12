import { ref } from 'vue';
import axios from 'axios';

import { teacherApplicationApi } from '../api/teacher-application.api';

import type { TeacherApplicationRequest } from '../types/teacher-application';

export function useTeacherApplication() {
  const loading = ref(false);
  const errorMessage = ref('');
  const successMessage = ref('');

  async function submitApplication(data: TeacherApplicationRequest) {
    loading.value = true;
    errorMessage.value = '';
    successMessage.value = '';

    try {
      await teacherApplicationApi.submit(data);

      successMessage.value = '教師帳號申請已送出，請等待審核。';

      return true;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message;

        if (typeof message === 'string') {
          errorMessage.value = message;
        } else {
          errorMessage.value = '申請失敗，請稍後再試。';
        }
      } else {
        errorMessage.value = '申請失敗，請稍後再試。';
      }

      return false;
    } finally {
      loading.value = false;
    }
  }

  return {
    loading,
    errorMessage,
    successMessage,
    submitApplication,
  };
}
