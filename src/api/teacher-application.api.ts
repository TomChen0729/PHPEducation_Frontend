import { api } from '../boot/axios';

import type {
  TeacherApplicationRequest,
  TeacherApplicationResponse,
} from '../types/teacher-application';

export const teacherApplicationApi = {
  submit(data: TeacherApplicationRequest) {
    return api.post<TeacherApplicationResponse>('/teacher-applications', data);
  },
};
