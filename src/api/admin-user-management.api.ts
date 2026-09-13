import { api } from '../boot/axios';

import type {
  TeacherApplicationListResponse,
  TeacherApprovalResponse,
} from '../types/teacher-application';

import type {
  AdminCourseListResponse,
  ApproveCoursesRequest,
  ApproveCoursesResponse,
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
   * Approve Courses
   * =========================
   *
   * source_course_id：
   * → 申請來源課程
   * → Backend 自動抓該課全部 pending 學生
   *
   * course_ids：
   * → 欲加入的一門或多門課程
   */
  approveCourses(data: ApproveCoursesRequest) {
    return api.post<ApproveCoursesResponse>('/student-applications/approve', data);
  },
};
