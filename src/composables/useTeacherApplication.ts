import { ref } from 'vue';
import axios from 'axios';

import { teacherApplicationApi } from '../api/teacher-application.api';

import type {
  TeacherApplicationRequest,
  TeacherApplicationErrorResponse,
} from '../types/teacher-application';

export function useTeacherApplication() {
  const loading = ref(false);
  const errorMessage = ref('');
  const successMessage = ref('');

  async function submitApplication(data: TeacherApplicationRequest) {
    loading.value = true;
    errorMessage.value = '';
    successMessage.value = '';

    try {
      const response = await teacherApplicationApi.submit(data);

      successMessage.value = response.data.message;

      return response.data.data;
    } catch (error: unknown) {
      if (axios.isAxiosError<TeacherApplicationErrorResponse>(error)) {
        errorMessage.value = error.response?.data.message ?? '申請失敗，請稍後再試';
      } else {
        errorMessage.value = '申請失敗，請稍後再試';
      }

      return null;
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
