import { defineRouter } from '#q-app';
import { createRouter, createWebHistory } from 'vue-router';

import { routes, handleHotUpdate } from 'vue-router/auto-routes';

import { useAuthStore } from '../stores/auth';
import { getHomePathByRole } from '../utils/auth-route';

export default defineRouter(({ store }) => {
  const Router = createRouter({
    routes,
    history: createWebHistory(import.meta.env.BASE_URL),
  });

  const authStore = useAuthStore(store);

  Router.beforeEach((to) => {
    const requiresAuth = to.meta.requiresAuth === true;

    const allowedRoles = to.meta.roles;

    // 公開頁面
    if (!requiresAuth) {
      return true;
    }

    // 沒有登入
    if (!authStore.user) {
      return {
        path: '/login',
        query: {
          redirect: to.fullPath,
        },
      };
    }

    // 有登入，但角色不符合
    if (allowedRoles && !allowedRoles.includes(authStore.user.role)) {
      return getHomePathByRole(authStore.user.role);
    }

    return true;
  });

  if (import.meta.hot) {
    handleHotUpdate(Router);
  }

  return Router;
});
