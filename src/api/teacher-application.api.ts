import { api } from '../boot/axios';

import type {
  TeacherApplicationListResponse,
  TeacherApplicationRequest,
  TeacherApplicationResponse,
  TeacherApprovalResponse,
} from '../types/teacher-application';

export const teacherApplicationApi = {
  /*
   * =========================
   * 教師帳號申請
   * =========================
   *
   * Public
   */
  submit(data: TeacherApplicationRequest) {
    return api.post<TeacherApplicationResponse>('/teacher-applications', data);
  },

  /*
   * =========================
   * 管理員取得教師申請
   * =========================
   */
  list(status: 'pending' | 'approved' = 'pending') {
    return api.get<TeacherApplicationListResponse>('/teacher-applications', {
      params: {
        status,
      },
    });
  },

  /*
   * =========================
   * 管理員核准教師
   * =========================
   */
  approve(applicationId: number) {
    return api.post<TeacherApprovalResponse>(`/teacher-applications/${applicationId}/approve`);
  },
};
