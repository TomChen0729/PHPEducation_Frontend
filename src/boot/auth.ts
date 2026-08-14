import { defineBoot } from '#q-app';

import { authApi } from '../api/auth.api';
import { useAuthStore } from '../stores/auth';

export default defineBoot(async ({ store }) => {
  const authStore = useAuthStore(store);

  // sessionStorage 沒有 Token
  if (!authStore.token) {
    return;
  }

  try {
    const response = await authApi.me();

    // Token 有效，恢復使用者資料
    authStore.setUser(response.data.user);
  } catch {
    // Token 無效或已過期
    authStore.clearAuth();
  }
});
