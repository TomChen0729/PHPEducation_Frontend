import { api } from '../boot/axios';

import type {
  TeacherStatsTableResponse,
  TeacherStudentSoloStatsResponse,
} from '../types/teacher-stats';

export const teacherStatsApi = {
  getBloom(courseId: number) {
    return api.get<TeacherStatsTableResponse>(`/teacher/courses/${courseId}/stats/bloom`);
  },

  getSolo(courseId: number) {
    return api.get<TeacherStatsTableResponse>(`/teacher/courses/${courseId}/stats/solo`);
  },

  getStudentSolo(courseId: number, studentId: number | null = null) {
    return api.get<TeacherStudentSoloStatsResponse>(
      `/teacher/courses/${courseId}/stats/student-solo`,
      {
        params: studentId === null ? {} : { student_id: studentId },
      },
    );
  },
};
