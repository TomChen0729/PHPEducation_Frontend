import { computed, ref } from 'vue';

import axios from 'axios';

import { teacherCourseStudentApi } from '../api/teacher-course-student.api';

import { useAuthStore } from '../stores/auth';

import type {
  CourseStudent,
  CourseStudentInput,
  CourseStudentStatus,
  StudentLookupResponse,
  UpdateCourseStudentRequest,
} from '../types/course-student';

export function useTeacherCourseStudents() {
  const authStore = useAuthStore();

  const students = ref<CourseStudent[]>([]);

  const status = ref<CourseStudentStatus>('approved');

  const searchKeyword = ref('');

  const loading = ref(false);

  const adding = ref(false);

  const lookingUp = ref(false);

  const updatingStudentId = ref<number | null>(null);

  const importing = ref(false);

  const downloadingTemplate = ref(false);

  const removingStudentId = ref<number | null>(null);

  const errorMessage = ref('');

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

  const studentCount = computed(() => filteredStudents.value.length);

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

  async function changeStatus(courseId: number, nextStatus: CourseStudentStatus) {
    if (status.value === nextStatus) {
      return;
    }

    status.value = nextStatus;
    searchKeyword.value = '';

    await fetchStudents(courseId);
  }

  async function lookupStudent(params: {
    student_no?: string;
    name?: string;
  }): Promise<StudentLookupResponse | null> {
    lookingUp.value = true;
    errorMessage.value = '';

    try {
      const response = await teacherCourseStudentApi.lookupStudent(params);

      return response.data;
    } catch (error: unknown) {
      errorMessage.value = getApiErrorMessage(error, '學生資料查詢失敗');

      return null;
    } finally {
      lookingUp.value = false;
    }
  }

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
       * Backend 新版行為：
       * - 已有帳號：會直接完成選課並標為 approved。
       * - 尚無帳號：才會進入 pending。
       *
       * 因此新增完成後保留目前篩選狀態並重新取得名單；
       * UI 再依新增內容提示使用者可切換「已開通／待審核」查看。
       */
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

  async function updateStudent(
    courseId: number,
    itemId: number,
    data: UpdateCourseStudentRequest,
  ): Promise<boolean> {
    updatingStudentId.value = itemId;
    errorMessage.value = '';

    try {
      await teacherCourseStudentApi.updateStudent(courseId, itemId, data);

      await fetchStudents(courseId);

      return true;
    } catch (error: unknown) {
      errorMessage.value = getApiErrorMessage(error, '學生資料修改失敗');

      return false;
    } finally {
      updatingStudentId.value = null;
    }
  }

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

  function setSearchKeyword(value: string) {
    searchKeyword.value = value;
  }

  function clearSearch() {
    searchKeyword.value = '';
  }

  function clearStudents() {
    students.value = [];
    searchKeyword.value = '';
    status.value = 'approved';
  }

  function clearErrorMessage() {
    errorMessage.value = '';
  }

  return {
    students,
    filteredStudents,
    status,
    searchKeyword,
    studentCount,

    loading,
    adding,
    lookingUp,
    updatingStudentId,
    importing,
    downloadingTemplate,
    removingStudentId,

    errorMessage,

    fetchStudents,
    changeStatus,
    lookupStudent,
    addStudents,
    updateStudent,
    removeStudent,
    downloadTemplate,
    importStudents,
    setSearchKeyword,
    clearSearch,
    clearStudents,
    clearErrorMessage,
  };
}

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
