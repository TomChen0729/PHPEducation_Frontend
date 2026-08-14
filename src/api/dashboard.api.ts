import { api } from '../boot/axios';

import type { DashboardResponse } from '../types/dashboard';

export const dashboardApi = {
  getDashboard() {
    return api.get<DashboardResponse>('/dashboard');
  },
};
