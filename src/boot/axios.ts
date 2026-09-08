import { defineBoot } from '#q-app';
import axios from 'axios';
import { Notify } from 'quasar';

import { useAuthStore } from '../stores/auth';

const api = axios.create({
  baseURL: import.meta.env.QCLI_API_BASE_URL,

  headers: {
    Accept: 'application/json',
  },
});

/*
 * ============================================================
 * Request Interceptor
 * ============================================================
 *
 * 每次 Request 自動附上 Bearer Token。
 */

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('auth_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  /*
   * 如果是 FormData：
   *
   * 不要自行指定 Content-Type。
   *
   * 讓瀏覽器自動產生：
   *
   * multipart/form-data;
   * boundary=----WebKitFormBoundary...
   */
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  return config;
});

/*
 * ============================================================
 * Boot
 * ============================================================
 */

export default defineBoot(({ router, store }) => {
  const authStore = useAuthStore(store);

  /*
   * 避免同一時間多支 API 都回 401，
   * 導致重複 Notify / 重複跳轉。
   */
  let handlingUnauthorized = false;

  /*
   * ==========================================================
   * Response Interceptor
   * ==========================================================
   */

  api.interceptors.response.use(
    /*
     * API 成功：
     * 原樣回傳 Response。
     */
    (response) => response,

    /*
     * API 失敗。
     */
    async (error: unknown) => {
      /*
       * 不是 Axios Error，
       * 直接交回原本呼叫 API 的地方處理。
       */
      if (!axios.isAxiosError(error)) {
        return Promise.reject(error instanceof Error ? error : new Error(String(error)));
      }

      const status = error.response?.status;

      /*
       * ======================================================
       * 401 Unauthorized
       * ======================================================
       */

      if (status === 401) {
        const requestUrl = error.config?.url ?? '';

        /*
         * Login API 本身帳密錯誤也會回 401。
         *
         * 這種情況不代表「登入中的 Token 過期」，
         * 所以不能在這裡做全域登出。
         */
        const isLoginRequest = requestUrl.includes('/auth/login');

        /*
         * 只有原本真的有登入 Token，
         * 才視為登入狀態失效。
         */
        const hasToken = Boolean(authStore.token) || Boolean(sessionStorage.getItem('auth_token'));

        if (!isLoginRequest && hasToken && !handlingUnauthorized) {
          handlingUnauthorized = true;

          /*
           * 先記住原本所在頁面，
           * 重新登入後未來可用 redirect 回來。
           */
          const currentPath = router.currentRoute.value.fullPath;

          /*
           * 清除：
           *
           * user
           * token
           * sessionStorage auth_token
           */
          authStore.clearAuth();

          /*
           * 避免目前已經在 login 頁還重複跳轉。
           */
          if (router.currentRoute.value.path !== '/login') {
            await router.replace({
              path: '/login',

              query: {
                redirect: currentPath,
              },
            });
          }

          Notify.create({
            type: 'warning',
            message: '登入已逾期，請重新登入',
            position: 'top',
            timeout: 2500,
          });

          /*
           * Router 完成後解除鎖定。
           *
           * 下一次若真的再次發生 401，
           * 才能重新處理。
           */
          handlingUnauthorized = false;
        }
      }

      /*
       * 401 處理完仍然 reject，
       * 讓原本 Composable 的 catch
       * 可以正常結束 loading 等流程。
       */
      return Promise.reject(error instanceof Error ? error : new Error(String(error)));
    },
  );
});

export { api };
