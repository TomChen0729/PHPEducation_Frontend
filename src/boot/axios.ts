import { defineBoot } from '#q-app';
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.QCLI_API_BASE_URL,

  headers: {
    Accept: 'application/json',
  },
});

/*
 * 每次 Request 自動附上 Bearer Token
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

export default defineBoot(() => {
  // 之後可以加入全域 401 處理
});

export { api };
