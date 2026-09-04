import { api } from '../boot/axios';

import type {
  ForgotPasswordResponse,
  LoginRequest,
  LoginResponse,
  LogoutResponse,
  MeResponse,
  StudentForgotPasswordRequest,
  TeacherForgotPasswordRequest,
} from '../types/auth';

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

  studentForgotPassword(data: StudentForgotPasswordRequest) {
    return api.post<ForgotPasswordResponse>('/auth/student/forgot-password', data);
  },

  teacherForgotPassword(data: TeacherForgotPasswordRequest) {
    return api.post<ForgotPasswordResponse>('/auth/teacher/forgot-password', data);
  },
};
