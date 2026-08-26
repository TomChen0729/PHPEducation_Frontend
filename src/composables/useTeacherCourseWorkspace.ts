import { ref } from 'vue';

import axios from 'axios';

import { teacherCourseApi } from '../api/teacher-course.api';

import type { Course, CourseRequest } from '../types/course';

export function useTeacherCourseWorkspace() {
  /*
   * =========================
   * 課程資訊
   * =========================
   *
   * ✅ 正式 Course API
   */
  const course = ref<Course | null>(null);

  const courseLoading = ref(false);

  const courseSaving = ref(false);

  const courseErrorMessage = ref('');

  /*
   * =========================
   * GET Course
   * =========================
   */
  async function fetchCourse(courseId: number): Promise<boolean> {
    courseLoading.value = true;

    courseErrorMessage.value = '';

    try {
      const response = await teacherCourseApi.getCourse(courseId);

      course.value = response.data.course;

      return true;
    } catch (error: unknown) {
      courseErrorMessage.value = getApiErrorMessage(error, '課程資料取得失敗');

      return false;
    } finally {
      courseLoading.value = false;
    }
  }

  /*
   * =========================
   * PUT Course
   * =========================
   */
  async function updateCourse(courseId: number, data: CourseRequest): Promise<boolean> {
    courseSaving.value = true;

    courseErrorMessage.value = '';

    try {
      const response = await teacherCourseApi.updateCourse(courseId, data);

      course.value = response.data.course;

      return true;
    } catch (error: unknown) {
      courseErrorMessage.value = getApiErrorMessage(error, '課程資料修改失敗');

      return false;
    } finally {
      courseSaving.value = false;
    }
  }

  return {
    /*
     * Course API
     */
    course,

    courseLoading,
    courseSaving,
    courseErrorMessage,

    fetchCourse,
    updateCourse,
  };
}

/*
 * =========================
 * API Error
 * =========================
 */
function getApiErrorMessage(error: unknown, fallback: string): string {
  if (!axios.isAxiosError(error)) {
    return fallback;
  }

  const data = error.response?.data as
    | {
        message?: string;

        errors?: Record<string, string[]>;
      }
    | undefined;

  const validationMessage = data?.errors
    ? Object.values(data.errors).flat().find(Boolean)
    : undefined;

  return validationMessage ?? data?.message ?? fallback;
}
