import { api } from '../boot/axios';

import type {
  ApproveTeacherResponse,
  TeacherApplicationRequest,
  TeacherApplicationResponse,
} from '../types/teacher-application';

export const teacherApplicationApi = {
  /**
   * 提交教師帳號申請
   */
  submit(data: TeacherApplicationRequest) {
    return api.post<TeacherApplicationResponse>('/teacher-applications', data);
  },

  /**
   * 管理員核准教師申請
   */
  approve(id: number) {
    return api.post<ApproveTeacherResponse>(`/teacher-applications/${id}/approve`);
  },
};
