import { defineBoot } from '#q-app';

import { authApi } from '../api/auth.api';
import { useAuthStore } from '../stores/auth';

export default defineBoot(async ({ store }) => {
  const authStore = useAuthStore(store);

  if (!authStore.token) {
    return;
  }

  try {
    const response = await authApi.me();

    authStore.setUser(response.data.user);
  } catch {
    authStore.clearAuth();
  }
});
