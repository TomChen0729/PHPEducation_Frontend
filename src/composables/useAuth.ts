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
  ResetPasswordRequest,
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

  const resetPasswordLoading = ref(false);
  const resetPasswordErrorMessage = ref('');
  const resetPasswordFieldErrors = ref<{
    token?: string | undefined;
    new_password?: string | undefined;
    new_password_confirmation?: string | undefined;
  }>({});

  const changePasswordLoading = ref(false);
  const changePasswordErrorMessage = ref('');
  const changePasswordFieldErrors = ref<{
    current_password?: string | undefined;
    new_password?: string | undefined;
  }>({});

  async function login(data: LoginRequest) {
    const normalizedData: LoginRequest = {
      account: data.account.trim(),
      password: data.password.trim(),
    };

    loading.value = true;
    errorMessage.value = '';

    try {
      const response = await authApi.login(normalizedData);

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
      forgotPasswordErrorMessage.value =
        role === 'student' ? '請輸入學號或綁定信箱' : '請輸入教師帳號';

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
        message: `${response.data.message || '重設密碼連結已寄出'}。連結自寄出起 15 分鐘內有效，請盡快至信箱操作。`,
        position: 'top',
        timeout: 5000,
      });

      return true;
    } catch (error: unknown) {
      if (axios.isAxiosError<ValidationErrorResponse>(error)) {
        const errors = error.response?.data?.errors;

        const fieldName = role === 'student' ? 'student_no' : 'teacher_account';

        const fieldMessage = errors?.[fieldName]?.[0];

        forgotPasswordErrorMessage.value =
          fieldMessage || error.response?.data?.message || '無法寄送重設連結，請確認帳號後再試一次';
      } else {
        forgotPasswordErrorMessage.value = '無法寄送重設連結，請稍後再試';
      }

      return false;
    } finally {
      forgotPasswordLoading.value = false;
    }
  }

  async function resetPassword(data: ResetPasswordRequest): Promise<boolean> {
    resetPasswordLoading.value = true;
    resetPasswordErrorMessage.value = '';
    resetPasswordFieldErrors.value = {};

    try {
      const response = await authApi.resetPassword(data);

      Notify.create({
        type: 'positive',
        message: response.data.message || '密碼已重設，請使用新密碼登入',
        position: 'top',
        timeout: 3000,
      });

      return true;
    } catch (error: unknown) {
      if (axios.isAxiosError<ValidationErrorResponse>(error)) {
        const responseData = error.response?.data;
        const errors = responseData?.errors ?? {};

        resetPasswordFieldErrors.value = {
          token: errors.token?.[0],
          new_password: errors.new_password?.[0],
          new_password_confirmation: errors.new_password_confirmation?.[0],
        };

        resetPasswordErrorMessage.value =
          errors.token?.[0] ||
          errors.new_password?.[0] ||
          errors.new_password_confirmation?.[0] ||
          errors.type?.[0] ||
          responseData?.message ||
          '無法重設密碼，請確認連結與輸入內容後再試一次';
      } else {
        resetPasswordErrorMessage.value = '無法重設密碼，請稍後再試';
      }

      return false;
    } finally {
      resetPasswordLoading.value = false;
    }
  }

  function clearResetPasswordError(
    field?: 'token' | 'new_password' | 'new_password_confirmation',
  ) {
    resetPasswordErrorMessage.value = '';

    if (!field) {
      resetPasswordFieldErrors.value = {};
      return;
    }

    resetPasswordFieldErrors.value = {
      ...resetPasswordFieldErrors.value,
      [field]: undefined,
    };
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
          new_password: errors.new_password?.[0] ?? errors.new_password_confirmation?.[0],
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

  function clearChangePasswordError(field?: 'current_password' | 'new_password') {
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

    resetPasswordLoading,
    resetPasswordErrorMessage,
    resetPasswordFieldErrors,

    changePasswordLoading,
    changePasswordErrorMessage,
    changePasswordFieldErrors,

    login,
    forgotPassword,
    clearForgotPasswordError,
    resetPassword,
    clearResetPasswordError,
    changePassword,
    clearChangePasswordError,
    logout,
  };
}
