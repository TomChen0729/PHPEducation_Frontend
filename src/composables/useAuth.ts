import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { Notify } from 'quasar';
import axios from 'axios';

import { authApi } from '../api/auth.api';
import { useAuthStore } from '../stores/auth';
import { getHomePathByRole } from '../utils/auth-route';

import type {
  ChangePasswordRequest,
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

  const changePasswordLoading = ref(false);
  const changePasswordErrorMessage = ref('');
  const changePasswordFieldErrors = ref<{
    current_password?: string | undefined;
    new_password?: string | undefined;
  }>({});

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

  async function changePassword(data: ChangePasswordRequest): Promise<boolean> {
    changePasswordLoading.value = true;
    changePasswordErrorMessage.value = '';
    changePasswordFieldErrors.value = {};

    try {
      const response = await authApi.changePassword(data);

      Notify.create({
        type: 'positive',
        message: response.data.message || '密碼修改成功',
        position: 'top',
        timeout: 2000,
      });

      return true;
    } catch (error: unknown) {
      if (axios.isAxiosError<ValidationErrorResponse>(error)) {
        const responseData = error.response?.data;
        const errors = responseData?.errors ?? {};

        changePasswordFieldErrors.value = {
          current_password: errors.current_password?.[0],
          new_password:
            errors.new_password?.[0] ??
            errors.new_password_confirmation?.[0],
        };

        changePasswordErrorMessage.value =
          errors.current_password?.[0] ||
          errors.new_password?.[0] ||
          errors.new_password_confirmation?.[0] ||
          responseData?.message ||
          '無法修改密碼，請確認輸入內容後再試一次';
      } else {
        changePasswordErrorMessage.value = '無法修改密碼，請稍後再試';
      }

      return false;
    } finally {
      changePasswordLoading.value = false;
    }
  }

  function clearChangePasswordError(
    field?: 'current_password' | 'new_password',
  ) {
    changePasswordErrorMessage.value = '';

    if (!field) {
      changePasswordFieldErrors.value = {};
      return;
    }

    changePasswordFieldErrors.value = {
      ...changePasswordFieldErrors.value,
      [field]: undefined,
    };
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

    changePasswordLoading,
    changePasswordErrorMessage,
    changePasswordFieldErrors,

    login,
    forgotPassword,
    clearForgotPasswordError,
    changePassword,
    clearChangePasswordError,
    logout,
  };
}
