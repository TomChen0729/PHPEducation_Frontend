import { defineBoot } from '#q-app';

import { authService } from '../services/auth.service';

// 正式 Backend 時改成：
// import { authApi } from '../api/auth.api';

import { useAuthStore } from '../stores/auth';

export default defineBoot(async ({ store }) => {
  const authStore = useAuthStore(store);

  // 沒有 Token
  if (!authStore.token) {
    return;
  }

  try {
    // Mock
    const response = await authService.me();

    // 正式 Backend：
    // const response =
    //   await authApi.me();

    authStore.setUser(response.data.user);
  } catch {
    authStore.clearAuth();
  }
});
