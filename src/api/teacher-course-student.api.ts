import { api } from '../boot/axios';

import type {
  CourseStudentListResponse,
  CourseStudentStatus,
  CreateCourseStudentsRequest,
  RemoveCourseStudentResponse,
  StudentApplicationResponse,
  StudentLookupResponse,
  UpdateCourseStudentRequest,
  UpdateCourseStudentResponse,
} from '../types/course-student';

export const teacherCourseStudentApi = {
  /*
   * ============================================================
   * Student List
   * ============================================================
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
   * Student Lookup
   * ============================================================
   *
   * 可依學號或姓名精確查詢既有學生帳號。
   */
  lookupStudent(params: { student_no?: string; name?: string }) {
    return api.get<StudentLookupResponse>('/teacher/students/lookup', {
      params,
    });
  },

  /*
   * ============================================================
   * Manual Add
   * ============================================================
   */
  addStudents(courseId: number, data: CreateCourseStudentsRequest) {
    return api.post<StudentApplicationResponse>(
      `/teacher/courses/${courseId}/student-applications`,
      data,
    );
  },

  /*
   * ============================================================
   * Update Student
   * ============================================================
   */
  updateStudent(courseId: number, itemId: number, data: UpdateCourseStudentRequest) {
    return api.put<UpdateCourseStudentResponse>(
      `/teacher/courses/${courseId}/student-applications/${itemId}`,
      data,
    );
  },

  /*
   * ============================================================
   * Remove
   * ============================================================
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
   */
  importStudents(teacherId: number, courseId: number, file: File) {
    const formData = new FormData();

    formData.append('tid', String(teacherId));
    formData.append('course_id', String(courseId));
    formData.append('file', file, file.name);

    return api.post<StudentApplicationResponse>('/teacher/student-applications', formData);
  },
};
