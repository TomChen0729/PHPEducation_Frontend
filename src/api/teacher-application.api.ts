import { api } from '../boot/axios';

import type {
  ApproveTeacherResponse,
  TeacherApplicationRequest,
  TeacherApplicationResponse,
} from '../types/teacher-application';

export const teacherApplicationApi = {
  submit(data: TeacherApplicationRequest) {
    return api.post<TeacherApplicationResponse>('/teacher-applications', data);
  },

  approve(id: number) {
    return api.post<ApproveTeacherResponse>(`/teacher-applications/${id}/approve`);
  },
};
