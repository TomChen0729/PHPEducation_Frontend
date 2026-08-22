import { ref } from 'vue';

import axios from 'axios';

import { teacherCourseApi } from '../api/teacher-course.api';

import type { Course, CourseRequest } from '../types/course';

import type { CourseStudentMock } from '../types/teacher-course-workspace';

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
   * 學生
   * =========================
   *
   * ⚠️ MOCK DATA
   *
   * 目前只有這一區是假資料。
   */
  const students = ref<CourseStudentMock[]>([
    {
      id: 1,

      studentNo: '1411131001',

      name: '王小明',

      email: 's1411131001@nutc.edu.tw',

      status: 'active',
    },
    {
      id: 2,

      studentNo: '1411131002',

      name: '李小華',

      email: 's1411131002@nutc.edu.tw',

      status: 'active',
    },
    {
      id: 3,

      studentNo: '1411131003',

      name: '陳小美',

      email: 's1411131003@nutc.edu.tw',

      status: 'pending',
    },
    {
      id: 4,

      studentNo: '1411131004',

      name: '林冠宇',

      email: 's1411131004@nutc.edu.tw',

      status: 'pending',
    },
    {
      id: 5,

      studentNo: '1411131005',

      name: '張雅婷',

      email: 's1411131005@nutc.edu.tw',

      status: 'active',
    },
  ]);

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

  /*
   * =========================
   * MOCK：新增學生
   * =========================
   */
  function addMockStudent(data: { studentNo: string; name: string; email: string }) {
    const maxId = students.value.reduce((max, student) => Math.max(max, student.id), 0);

    students.value.push({
      id: maxId + 1,

      studentNo: data.studentNo,

      name: data.name,

      email: data.email,

      status: 'pending',
    });
  }

  /*
   * =========================
   * MOCK：刪除學生
   * =========================
   */
  function removeMockStudent(studentId: number) {
    students.value = students.value.filter((student) => student.id !== studentId);
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

    /*
     * Student MOCK
     */
    students,

    addMockStudent,
    removeMockStudent,
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
