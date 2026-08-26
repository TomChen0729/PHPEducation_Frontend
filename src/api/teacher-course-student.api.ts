import { api } from '../boot/axios';

import type {
  CourseStudentListResponse,
  CourseStudentStatus,
  CreateCourseStudentsRequest,
  RemoveCourseStudentResponse,
  StudentApplicationResponse,
} from '../types/course-student';

export const teacherCourseStudentApi = {
  /*
   * ============================================================
   * Student List
   * ============================================================
   *
   * approved
   * → 已開通
   *
   * pending
   * → 待審核
   */
  getStudents(courseId: number, status: CourseStudentStatus) {
    return api.get<CourseStudentListResponse>(`/teacher/courses/${courseId}/student-applications`, {
      params: {
        status,
      },
    });
  },

  /*
   * ============================================================
   * Manual Add
   * ============================================================
   *
   * 一次可送多位學生。
   */
  addStudents(courseId: number, data: CreateCourseStudentsRequest) {
    return api.post<StudentApplicationResponse>(
      `/teacher/courses/${courseId}/student-applications`,
      data,
    );
  },

  /*
   * ============================================================
   * Remove
   * ============================================================
   *
   * pending：
   * → 刪除申請名冊列
   *
   * approved：
   * → 移除 enrollment
   * → 學生帳號保留
   */
  removeStudent(courseId: number, itemId: number) {
    return api.delete<RemoveCourseStudentResponse>(
      `/teacher/courses/${courseId}/student-applications/${itemId}`,
    );
  },

  /*
   * ============================================================
   * Excel Template
   * ============================================================
   */
  downloadTemplate() {
    return api.get<Blob>('/teacher/student-applications/template', {
      responseType: 'blob',
    });
  },

  /*
   * ============================================================
   * Excel Import
   * ============================================================
   *
   * Backend 目前需要：
   *
   * tid
   * course_id
   * file
   */
  importStudents(teacherId: number, courseId: number, file: File) {
    const formData = new FormData();

    formData.append('tid', String(teacherId));

    formData.append('course_id', String(courseId));

    formData.append('file', file, file.name);

    return api.post<StudentApplicationResponse>('/teacher/student-applications', formData);
  },
};
