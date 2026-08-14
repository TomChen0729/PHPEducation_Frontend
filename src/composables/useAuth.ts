import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { Notify } from 'quasar';
import axios from 'axios';

// =========================
// 目前：使用假資料
// =========================
import { authService } from '../services/auth.service';

// =========================
// 正式 Backend 時改用這個
// =========================
// import { authApi } from '../api/auth.api';

import { useAuthStore } from '../stores/auth';
import { getHomePathByRole } from '../utils/auth-route';

import type { LoginRequest, LoginErrorResponse, UserRole } from '../types/auth';

export function useAuth() {
  const router = useRouter();
  const authStore = useAuthStore();

  const loading = ref(false);
  const errorMessage = ref('');

  // =========================
  // Login
  // =========================
  async function login(data: LoginRequest) {
    loading.value = true;
    errorMessage.value = '';

    try {
      // 假資料
      const response = await authService.login(data);

      // 正式 Backend 時改成：
      // const response =
      //   await authApi.login(data);

      authStore.setAuth(response.data);

      await redirectByRole(response.data.user.role);
    } catch (error: unknown) {
      // 正式 Axios API Error
      if (axios.isAxiosError<LoginErrorResponse>(error)) {
        errorMessage.value = error.response?.data.message ?? '登入失敗，請稍後再試';

        return;
      }

      // Mock Error
      if (error instanceof Error) {
        errorMessage.value = error.message;

        return;
      }

      errorMessage.value = '登入失敗，請稍後再試';
    } finally {
      loading.value = false;
    }
  }

  // =========================
  // Logout
  // =========================
  async function logout() {
    try {
      // 假資料
      const response = await authService.logout();

      // 正式 Backend 時改成：
      // const response =
      //   await authApi.logout();

      authStore.clearAuth();

      await router.replace('/login');

      Notify.create({
        type: 'positive',
        message: response.data.message,
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

  // =========================
  // Role Redirect
  // =========================
  async function redirectByRole(role: UserRole) {
    await router.replace(getHomePathByRole(role));
  }

  return {
    loading,
    errorMessage,

    login,
    logout,
  };
}
