import { ref } from 'vue';
import axios from 'axios';

import { teacherApplicationApi } from '../api/teacher-application.api';

import type { TeacherApplicationRequest } from '../types/teacher-application';

export function useTeacherApplication() {
  const loading = ref(false);
  const errorMessage = ref('');

  async function submitApplication(data: TeacherApplicationRequest): Promise<boolean> {
    loading.value = true;
    errorMessage.value = '';

    try {
      await teacherApplicationApi.submit(data);

      return true;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message;

        if (message === 'This email is already registered as a teacher.') {
          errorMessage.value = '此 Email 已註冊為教師帳號';
        } else if (message === 'You have a pending teacher application.') {
          errorMessage.value = '此 Email 已有待審核的教師申請';
        } else if (error.response?.status === 422) {
          errorMessage.value = '申請資料格式不正確，請檢查後重新送出';
        } else {
          errorMessage.value = message ?? '教師帳號申請失敗';
        }
      } else {
        errorMessage.value = '教師帳號申請失敗';
      }

      return false;
    } finally {
      loading.value = false;
    }
  }

  return {
    loading,
    errorMessage,
    submitApplication,
  };
}
