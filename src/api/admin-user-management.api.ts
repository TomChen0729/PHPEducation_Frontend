import { api } from '../boot/axios';

import type {
  TeacherApplicationListResponse,
  TeacherApprovalResponse,
} from '../types/teacher-application';

import type {
  AdminCourseListResponse,
  ApproveStudentsRequest,
  ApproveStudentsResponse,
  PendingStudentListResponse,
  UserStatsApiResponse,
} from '../types/user-management';

export const adminUserManagementApi = {
  /*
   * =========================
   * Stats
   * =========================
   */
  getStats() {
    return api.get<UserStatsApiResponse>('/stats');
  },

  /*
   * =========================
   * Teacher Applications
   * =========================
   */
  getTeacherApplications(status = 'pending') {
    return api.get<TeacherApplicationListResponse>('/teacher-applications', {
      params: {
        status,
      },
    });
  },

  approveTeacher(applicationId: number) {
    return api.post<TeacherApprovalResponse>(`/teacher-applications/${applicationId}/approve`);
  },

  /*
   * =========================
   * Courses
   * =========================
   */
  getCourses() {
    return api.get<AdminCourseListResponse>('/courses');
  },

  /*
   * =========================
   * Student Applications
   * =========================
   */
  getStudentApplications(params?: {
    courseId?: number;

    status?: string;

    keyword?: string;
  }) {
    return api.get<PendingStudentListResponse>('/student-applications', {
      params: {
        course_id: params?.courseId,

        status: params?.status ?? 'pending',

        q: params?.keyword || undefined,
      },
    });
  },

  /*
   * =========================
   * Approve Students
   * =========================
   */
  approveStudents(data: ApproveStudentsRequest) {
    return api.post<ApproveStudentsResponse>('/student-applications/approve', data);
  },
};
