import { api } from '../boot/axios';

import type { LoginRequest, LoginResponse, LogoutResponse, MeResponse } from '../types/auth';

export const authApi = {
  login(data: LoginRequest) {
    return api.post<LoginResponse>('/auth/login', data);
  },

  logout() {
    return api.post<LogoutResponse>('/auth/logout');
  },

  me() {
    return api.get<MeResponse>('/auth/me');
  },
};
