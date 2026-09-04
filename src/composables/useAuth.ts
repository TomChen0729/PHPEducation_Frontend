import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { Notify } from 'quasar';
import axios from 'axios';

import { authApi } from '../api/auth.api';
import { useAuthStore } from '../stores/auth';
import { getHomePathByRole } from '../utils/auth-route';

import type {
  ForgotPasswordRole,
  LoginErrorResponse,
  LoginRequest,
  UserRole,
  ValidationErrorResponse,
} from '../types/auth';

export function useAuth() {
  const router = useRouter();
  const authStore = useAuthStore();

  const loading = ref(false);
  const errorMessage = ref('');

  const forgotPasswordLoading = ref(false);
  const forgotPasswordErrorMessage = ref('');

  async function login(data: LoginRequest) {
    loading.value = true;
    errorMessage.value = '';

    try {
      const response = await authApi.login(data);

      authStore.setAuth(response.data);

      await redirectByRole(response.data.user.role);
    } catch (error: unknown) {
      if (axios.isAxiosError<LoginErrorResponse>(error)) {
        errorMessage.value = '帳號或密碼錯誤，請重新輸入';
      } else {
        errorMessage.value = '帳號或密碼錯誤，請重新輸入';
      }
    } finally {
      loading.value = false;
    }
  }

  async function forgotPassword(role: ForgotPasswordRole, account: string): Promise<boolean> {
    const normalizedAccount = account.trim();

    forgotPasswordErrorMessage.value = '';

    if (!normalizedAccount) {
      forgotPasswordErrorMessage.value = role === 'student' ? '請輸入學號' : '請輸入教師帳號';

      return false;
    }

    forgotPasswordLoading.value = true;

    try {
      const response =
        role === 'student'
          ? await authApi.studentForgotPassword({
              student_no: normalizedAccount,
            })
          : await authApi.teacherForgotPassword({
              teacher_account: normalizedAccount,
            });

      Notify.create({
        type: 'positive',
        message: response.data.message || '新密碼已寄出',
        position: 'top',
        timeout: 2500,
      });

      return true;
    } catch (error: unknown) {
      if (axios.isAxiosError<ValidationErrorResponse>(error)) {
        const errors = error.response?.data?.errors;

        const fieldName = role === 'student' ? 'student_no' : 'teacher_account';

        const fieldMessage = errors?.[fieldName]?.[0];

        forgotPasswordErrorMessage.value =
          fieldMessage || error.response?.data?.message || '無法重設密碼，請確認帳號後再試一次';
      } else {
        forgotPasswordErrorMessage.value = '無法重設密碼，請稍後再試';
      }

      return false;
    } finally {
      forgotPasswordLoading.value = false;
    }
  }

  async function logout() {
    try {
      const response = await authApi.logout();

      authStore.clearAuth();

      await router.replace('/login');

      Notify.create({
        type: 'positive',
        message: response.data.message || '登出成功',
        position: 'top',
        timeout: 1500,
      });
    } catch {
      authStore.clearAuth();

      await router.replace('/login');

      Notify.create({
        type: 'warning',
        message: '登入狀態已清除',
        position: 'top',
        timeout: 1500,
      });
    }
  }

  async function redirectByRole(role: UserRole) {
    await router.replace(getHomePathByRole(role));
  }

  function clearForgotPasswordError() {
    forgotPasswordErrorMessage.value = '';
  }

  return {
    loading,
    errorMessage,

    forgotPasswordLoading,
    forgotPasswordErrorMessage,

    login,
    forgotPassword,
    clearForgotPasswordError,
    logout,
  };
}
