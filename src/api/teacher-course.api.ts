import { api } from '../boot/axios';

import type {
  CourseListResponse,
  CourseResponse,
  CreateCourseRequest,
  DeleteCourseResponse,
  UpdateCourseRequest,
} from '../types/course';

export const teacherCourseApi = {
  getAll() {
    return api.get<CourseListResponse>('/teacher/courses');
  },

  getById(courseId: number) {
    return api.get<CourseResponse>(`/teacher/courses/${courseId}`);
  },

  create(data: CreateCourseRequest) {
    return api.post<CourseResponse>('/teacher/courses', data);
  },

  update(courseId: number, data: UpdateCourseRequest) {
    return api.put<CourseResponse>(`/teacher/courses/${courseId}`, data);
  },

  remove(courseId: number) {
    return api.delete<DeleteCourseResponse>(`/teacher/courses/${courseId}`);
  },
};
