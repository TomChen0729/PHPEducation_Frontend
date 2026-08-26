import { computed, ref } from 'vue';

import axios from 'axios';

import { teacherCourseStudentApi } from '../api/teacher-course-student.api';

import { useAuthStore } from '../stores/auth';

import type {
  CourseStudent,
  CourseStudentInput,
  CourseStudentStatus,
} from '../types/course-student';

export function useTeacherCourseStudents() {
  /*
   * =========================
   * Auth
   * =========================
   */
  const authStore = useAuthStore();

  /*
   * =========================
   * Data
   * =========================
   */
  const students = ref<CourseStudent[]>([]);

  /*
   * 預設：
   * 已開通學生
   */
  const status = ref<CourseStudentStatus>('approved');

  const searchKeyword = ref('');

  /*
   * =========================
   * Loading
   * =========================
   */
  const loading = ref(false);

  const adding = ref(false);

  const importing = ref(false);

  const downloadingTemplate = ref(false);

  const removingStudentId = ref<number | null>(null);

  /*
   * =========================
   * Error
   * =========================
   */
  const errorMessage = ref('');

  /*
   * =========================
   * Filter
   * =========================
   *
   * Backend 教師名冊 API
   * 目前沒有 q 搜尋，
   * 所以搜尋先在前端處理。
   */
  const filteredStudents = computed(() => {
    const keyword = searchKeyword.value.trim().toLowerCase();

    if (!keyword) {
      return students.value;
    }

    return students.value.filter((student) => {
      return (
        student.student_no.toLowerCase().includes(keyword) ||
        student.name.toLowerCase().includes(keyword) ||
        student.email.toLowerCase().includes(keyword)
      );
    });
  });

  /*
   * =========================
   * Counts
   * =========================
   */
  const studentCount = computed(() => {
    return filteredStudents.value.length;
  });

  /*
   * ============================================================
   * GET Students
   * ============================================================
   */
  async function fetchStudents(courseId: number): Promise<boolean> {
    loading.value = true;

    errorMessage.value = '';

    try {
      const response = await teacherCourseStudentApi.getStudents(courseId, status.value);

      students.value = response.data.items;

      return true;
    } catch (error: unknown) {
      errorMessage.value = getApiErrorMessage(error, '學生名單取得失敗');

      students.value = [];

      return false;
    } finally {
      loading.value = false;
    }
  }

  /*
   * ============================================================
   * Change Status
   * ============================================================
   */
  async function changeStatus(courseId: number, nextStatus: CourseStudentStatus) {
    /*
     * 沒有改變就不用重新 Request。
     */
    if (status.value === nextStatus) {
      return;
    }

    status.value = nextStatus;

    searchKeyword.value = '';

    await fetchStudents(courseId);
  }

  /*
   * ============================================================
   * Manual Add
   * ============================================================
   */
  async function addStudents(
    courseId: number,
    inputStudents: CourseStudentInput[],
  ): Promise<boolean> {
    adding.value = true;

    errorMessage.value = '';

    try {
      await teacherCourseStudentApi.addStudents(courseId, {
        students: inputStudents,
      });

      /*
       * 新增後一定是 Pending。
       *
       * 自動切換到「待審核」，
       * 老師可以立刻看到剛新增的人。
       */
      status.value = 'pending';

      searchKeyword.value = '';

      await fetchStudents(courseId);

      return true;
    } catch (error: unknown) {
      errorMessage.value = getApiErrorMessage(error, '學生新增失敗');

      return false;
    } finally {
      adding.value = false;
    }
  }

  /*
   * ============================================================
   * Remove
   * ============================================================
   */
  async function removeStudent(courseId: number, itemId: number): Promise<boolean> {
    removingStudentId.value = itemId;

    errorMessage.value = '';

    try {
      await teacherCourseStudentApi.removeStudent(courseId, itemId);

      await fetchStudents(courseId);

      return true;
    } catch (error: unknown) {
      errorMessage.value = getApiErrorMessage(error, '學生移除失敗');

      return false;
    } finally {
      removingStudentId.value = null;
    }
  }

  /*
   * ============================================================
   * Download Excel Template
   * ============================================================
   */
  async function downloadTemplate(): Promise<boolean> {
    downloadingTemplate.value = true;

    errorMessage.value = '';

    try {
      const response = await teacherCourseStudentApi.downloadTemplate();

      const url = URL.createObjectURL(response.data);

      const link = document.createElement('a');

      link.href = url;

      link.download = '學生匯入範本.xlsx';

      document.body.appendChild(link);

      link.click();

      link.remove();

      URL.revokeObjectURL(url);

      return true;
    } catch (error: unknown) {
      errorMessage.value = getApiErrorMessage(error, '學生匯入範本下載失敗');

      return false;
    } finally {
      downloadingTemplate.value = false;
    }
  }

  /*
   * ============================================================
   * Excel Import
   * ============================================================
   */
  async function importStudents(courseId: number, file: File): Promise<boolean> {
    importing.value = true;

    errorMessage.value = '';

    try {
      const teacherId = authStore.user?.id;

      if (teacherId === undefined || teacherId === null) {
        errorMessage.value = '無法取得目前教師資料';

        return false;
      }

      await teacherCourseStudentApi.importStudents(teacherId, courseId, file);

      /*
       * Excel 匯入後也都是 Pending。
       */
      status.value = 'pending';

      searchKeyword.value = '';

      await fetchStudents(courseId);

      return true;
    } catch (error: unknown) {
      errorMessage.value = getApiErrorMessage(error, '學生名冊匯入失敗');

      return false;
    } finally {
      importing.value = false;
    }
  }

  /*
   * =========================
   * Search
   * =========================
   */
  function setSearchKeyword(value: string) {
    searchKeyword.value = value;
  }

  function clearSearch() {
    searchKeyword.value = '';
  }

  /*
   * =========================
   * Clear
   * =========================
   */
  function clearStudents() {
    students.value = [];

    searchKeyword.value = '';

    status.value = 'approved';
  }

  function clearErrorMessage() {
    errorMessage.value = '';
  }

  return {
    /*
     * Data
     */
    students,

    filteredStudents,

    status,

    searchKeyword,

    studentCount,

    /*
     * Loading
     */
    loading,

    adding,

    importing,

    downloadingTemplate,

    removingStudentId,

    /*
     * Error
     */
    errorMessage,

    /*
     * Actions
     */
    fetchStudents,

    changeStatus,

    addStudents,

    removeStudent,

    downloadTemplate,

    importStudents,

    setSearchKeyword,

    clearSearch,

    clearStudents,

    clearErrorMessage,
  };
}

/*
 * ============================================================
 * API Error
 * ============================================================
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
