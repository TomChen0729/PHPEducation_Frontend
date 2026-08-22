import { api } from '../boot/axios';

import type { CourseListResponse, CourseRequest, CourseResponse } from '../types/course';

export const teacherCourseApi = {
  getCourses() {
    return api.get<CourseListResponse>('/teacher/courses');
  },

  getCourse(courseId: number) {
    return api.get<CourseResponse>(`/teacher/courses/${courseId}`);
  },

  createCourse(data: CourseRequest) {
    return api.post<CourseResponse>('/teacher/courses', data);
  },

  updateCourse(courseId: number, data: CourseRequest) {
    return api.put<CourseResponse>(`/teacher/courses/${courseId}`, data);
  },

  deleteCourse(courseId: number) {
    return api.delete(`/teacher/courses/${courseId}`);
  },
};
