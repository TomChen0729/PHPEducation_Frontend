import { ref } from 'vue';
import axios from 'axios';

import { dashboardApi } from '../api/dashboard.api';

import type { DashboardResponse } from '../types/dashboard';

export function useDashboard() {
  const dashboard = ref<DashboardResponse | null>(null);

  const loading = ref(false);
  const errorMessage = ref('');

  async function fetchDashboard() {
    loading.value = true;
    errorMessage.value = '';

    try {
      const response = await dashboardApi.getDashboard();

      dashboard.value = response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        errorMessage.value =
          error.response?.status === 401 ? '登入狀態已失效' : 'Dashboard 資料取得失敗';
      } else {
        errorMessage.value = 'Dashboard 資料取得失敗';
      }
    } finally {
      loading.value = false;
    }
  }

  return {
    dashboard,
    loading,
    errorMessage,
    fetchDashboard,
  };
}
