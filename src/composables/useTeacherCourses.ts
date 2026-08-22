import { ref } from 'vue';
import axios from 'axios';

import { teacherCourseApi } from '../api/teacher-course.api';

import type { Course, CourseRequest } from '../types/course';

export function useTeacherCourses() {
  const courses = ref<Course[]>([]);
  const loading = ref(false);
  const errorMessage = ref('');

  async function fetchCourses() {
    loading.value = true;
    errorMessage.value = '';

    try {
      const response = await teacherCourseApi.getCourses();

      courses.value = response.data.courses;
    } catch {
      errorMessage.value = '課程資料取得失敗';
    } finally {
      loading.value = false;
    }
  }

  async function createCourse(data: CourseRequest) {
    loading.value = true;
    errorMessage.value = '';

    try {
      await teacherCourseApi.createCourse(data);

      await fetchCourses();

      return true;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        errorMessage.value = error.response?.data?.message ?? '課程建立失敗';
      } else {
        errorMessage.value = '課程建立失敗';
      }

      return false;
    } finally {
      loading.value = false;
    }
  }

  async function updateCourse(courseId: number, data: CourseRequest) {
    loading.value = true;
    errorMessage.value = '';

    try {
      await teacherCourseApi.updateCourse(courseId, data);

      await fetchCourses();

      return true;
    } catch {
      errorMessage.value = '課程修改失敗';

      return false;
    } finally {
      loading.value = false;
    }
  }

  async function deleteCourse(courseId: number) {
    loading.value = true;
    errorMessage.value = '';

    try {
      await teacherCourseApi.deleteCourse(courseId);

      await fetchCourses();

      return true;
    } catch {
      errorMessage.value = '課程刪除失敗';

      return false;
    } finally {
      loading.value = false;
    }
  }

  return {
    courses,
    loading,
    errorMessage,

    fetchCourses,
    createCourse,
    updateCourse,
    deleteCourse,
  };
}
