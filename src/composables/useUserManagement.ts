import { computed, ref } from 'vue';

import axios from 'axios';

import { adminUserManagementApi } from '../api/admin-user-management.api';

import type { TeacherApplication } from '../types/teacher-application';

import type {
  AdminCourse,
  PendingStudentApiItem,
  PendingStudentItem,
  UserStats,
} from '../types/user-management';

export function useUserManagement() {
  /*
   * ============================================================
   * Stats
   * ============================================================
   */
  const stats = ref<UserStats>({
    teacherCount: 0,

    studentCount: 0,

    courseCount: 0,

    semesterCourseCount: 0,

    semester: null,
  });

  const statsLoading = ref(false);

  /*
   * ============================================================
   * Teacher Applications
   * ============================================================
   */
  const teacherApplications = ref<TeacherApplication[]>([]);

  const teacherApplicationsLoading = ref(false);

  /*
   * 記錄目前正在核准哪一位教師
   */
  const approvingTeacherId = ref<number | null>(null);

  /*
   * ============================================================
   * Courses
   * ============================================================
   */
  const courses = ref<AdminCourse[]>([]);

  const coursesLoading = ref(false);

  const selectedCourseId = ref<number | null>(null);

  /*
   * 有 Pending 學生的 Course ID
   */
  const pendingCourseIds = ref<number[]>([]);

  /*
   * 學生帳號開通區只顯示
   * 有 Pending Student 的課程。
   */
  const pendingCourses = computed(() => {
    const idSet = new Set(pendingCourseIds.value);

    return courses.value.filter((course) => idSet.has(course.id));
  });

  /*
   * ============================================================
   * Student Applications
   * ============================================================
   */
  const pendingStudents = ref<PendingStudentItem[]>([]);

  const studentsLoading = ref(false);

  /*
   * 管理員目前勾選的學生 Application Item ID
   */
  const selectedStudentIds = ref<number[]>([]);

  const studentSearchKeyword = ref('');

  /*
   * 全站 pending Student Item 數量
   *
   * 用於頁面右上角「待處理」。
   */
  const pendingStudentTotal = ref(0);

  /*
   * 批次開通 Loading
   */
  const approvingStudents = ref(false);

  /*
   * ============================================================
   * Common
   * ============================================================
   */
  const errorMessage = ref('');

  /*
   * 教師申請 + 待開通學生
   */
  const pendingCount = computed(() => {
    return teacherApplications.value.length + pendingStudentTotal.value;
  });

  /*
   * 目前選擇的課程
   */
  const selectedCourse = computed(() => {
    if (selectedCourseId.value === null) {
      return null;
    }

    return courses.value.find((course) => course.id === selectedCourseId.value) ?? null;
  });

  /*
   * ============================================================
   * Init
   * ============================================================
   */
  async function initialize(): Promise<void> {
    errorMessage.value = '';

    /*
     * 第一批資料平行取得。
     */
    await Promise.all([
      fetchStats(),

      fetchTeacherApplications(),

      fetchCourses(),

      fetchPendingStudentTotal(),
    ]);

    /*
     * 學生帳號開通：
     * 只從有 Pending Student
     * 的課程中選擇。
     */
    if (pendingCourses.value.length > 0) {
      const firstCourse = pendingCourses.value[0];

      if (firstCourse) {
        await selectCourse(firstCourse.id);
      }
    } else {
      selectedCourseId.value = null;

      pendingStudents.value = [];

      selectedStudentIds.value = [];
    }
  }

  /*
   * ============================================================
   * Stats
   * ============================================================
   */
  async function fetchStats(): Promise<void> {
    statsLoading.value = true;

    try {
      const response = await adminUserManagementApi.getStats();

      stats.value = {
        teacherCount: response.data.teacher_count,

        studentCount: response.data.student_count,

        courseCount: response.data.course_count,

        semesterCourseCount: response.data.semester_course_count,

        semester: response.data.semester,
      };
    } catch (error: unknown) {
      setError(error, '統計資料取得失敗');
    } finally {
      statsLoading.value = false;
    }
  }

  /*
   * ============================================================
   * Teacher Applications
   * ============================================================
   */
  async function fetchTeacherApplications(): Promise<void> {
    teacherApplicationsLoading.value = true;

    try {
      const response = await adminUserManagementApi.getTeacherApplications('pending');

      teacherApplications.value = response.data.applications;
    } catch (error: unknown) {
      setError(error, '教師申請資料取得失敗');
    } finally {
      teacherApplicationsLoading.value = false;
    }
  }

  async function approveTeacherApplication(applicationId: number): Promise<boolean> {
    approvingTeacherId.value = applicationId;

    errorMessage.value = '';

    try {
      await adminUserManagementApi.approveTeacher(applicationId);

      /*
       * 成功後從 Pending 清單移除。
       */
      teacherApplications.value = teacherApplications.value.filter(
        (application) => application.id !== applicationId,
      );

      /*
       * Teacher 數量已增加。
       */
      await fetchStats();

      return true;
    } catch (error: unknown) {
      setError(error, '教師帳號核准失敗');

      return false;
    } finally {
      approvingTeacherId.value = null;
    }
  }

  /*
   * ============================================================
   * Courses
   * ============================================================
   */
  async function fetchCourses(): Promise<void> {
    coursesLoading.value = true;

    try {
      const response = await adminUserManagementApi.getCourses();

      courses.value = response.data.courses.map((course) => ({
        id: course.id,

        name: course.name,

        description: course.description,

        semester: course.semester,

        class_name: course.class_name,

        teacherId: course.teacherId,
      }));
    } catch (error: unknown) {
      setError(error, '課程資料取得失敗');
    } finally {
      coursesLoading.value = false;
    }
  }

  /*
   * ============================================================
   * Select Course
   * ============================================================
   */
  async function selectCourse(courseId: number): Promise<void> {
    selectedCourseId.value = courseId;

    /*
     * 換課程時：
     * 搜尋條件、選取狀態全部重設。
     */
    studentSearchKeyword.value = '';

    selectedStudentIds.value = [];

    await fetchStudentsForCourse();
  }

  /*
   * ============================================================
   * Students
   * ============================================================
   */
  async function fetchStudentsForCourse(keyword = studentSearchKeyword.value): Promise<void> {
    if (selectedCourseId.value === null) {
      pendingStudents.value = [];

      selectedStudentIds.value = [];

      return;
    }

    studentsLoading.value = true;

    errorMessage.value = '';

    try {
      studentSearchKeyword.value = keyword;

      const response = await adminUserManagementApi.getStudentApplications({
        courseId: selectedCourseId.value,

        status: 'pending',

        keyword: keyword.trim(),
      });

      pendingStudents.value = response.data.items.map(mapPendingStudent);

      /*
       * 搜尋 / 重新載入後，
       * 清除之前勾選。
       */
      selectedStudentIds.value = [];
    } catch (error: unknown) {
      setError(error, '待開通學生取得失敗');
    } finally {
      studentsLoading.value = false;
    }
  }

  /*
   * ============================================================
   * Pending Student Overview
   * ============================================================
   *
   * 一次取得所有 Pending Student，
   * 用來：
   *
   * 1. 計算全站待開通學生數量
   * 2. 找出哪些課程目前有待開通學生
   */
  async function fetchPendingStudentTotal(): Promise<void> {
    try {
      const response = await adminUserManagementApi.getStudentApplications({
        status: 'pending',
      });

      const items = response.data.items;

      /*
       * 全站 Pending Student 數量
       */
      pendingStudentTotal.value = items.length;

      /*
       * 找出所有有 Pending Student
       * 的 Course ID。
       */
      pendingCourseIds.value = [
        ...new Set(
          items
            .map((item) => item.course_id)
            .filter((courseId): courseId is number => courseId !== null),
        ),
      ];
    } catch (error: unknown) {
      setError(error, '待開通學生資料取得失敗');
    }
  }

  /*
   * ============================================================
   * Student Selection
   * ============================================================
   */
  function setSelectedStudentIds(ids: number[]) {
    selectedStudentIds.value = [...new Set(ids)];
  }

  function clearStudentSelection() {
    selectedStudentIds.value = [];
  }

  /*
   * ============================================================
   * Approve Students
   * ============================================================
   */
  async function approveSelectedStudents(): Promise<{
    activatedCount: number;

    createdCount: number;

    enrolledCount: number;
  } | null> {
    if (selectedCourseId.value === null || selectedStudentIds.value.length === 0) {
      return null;
    }

    approvingStudents.value = true;

    errorMessage.value = '';

    try {
      const response = await adminUserManagementApi.approveStudents({
        course_id: selectedCourseId.value,

        item_ids: [...selectedStudentIds.value],
      });

      /*
       * 先重新取得：
       *
       * 1. 全站 Pending
       * 2. Stats
       */
      await Promise.all([fetchPendingStudentTotal(), fetchStats()]);

      /*
       * 檢查目前課程
       * 是否還有 Pending Student。
       */
      const currentCourseStillPending = pendingCourses.value.some(
        (course) => course.id === selectedCourseId.value,
      );

      if (currentCourseStillPending) {
        /*
         * 目前課程還有 Pending，
         * 重新取得這門課學生。
         */
        await fetchStudentsForCourse(studentSearchKeyword.value);
      } else {
        /*
         * 目前課程已經全部處理完。
         *
         * 自動切到下一門
         * 有 Pending Student 的課程。
         */
        const nextCourse = pendingCourses.value[0];

        if (nextCourse) {
          await selectCourse(nextCourse.id);
        } else {
          /*
           * 全部 Pending 都處理完。
           */
          selectedCourseId.value = null;

          pendingStudents.value = [];

          selectedStudentIds.value = [];

          studentSearchKeyword.value = '';
        }
      }

      return {
        activatedCount: response.data.activated_count,

        createdCount: response.data.created_count,

        enrolledCount: response.data.enrolled_count,
      };
    } catch (error: unknown) {
      setError(error, '學生帳號開通失敗');

      return null;
    } finally {
      approvingStudents.value = false;
    }
  }

  /*
   * ============================================================
   * Search
   * ============================================================
   */
  async function searchStudents(keyword: string) {
    await fetchStudentsForCourse(keyword);
  }

  async function clearStudentSearch() {
    studentSearchKeyword.value = '';

    await fetchStudentsForCourse('');
  }

  /*
   * ============================================================
   * Error
   * ============================================================
   */
  function clearErrorMessage() {
    errorMessage.value = '';
  }

  function setError(error: unknown, fallback: string) {
    errorMessage.value = getApiErrorMessage(error, fallback);
  }

  /*
   * ============================================================
   * Backend Student → Frontend Student
   * ============================================================
   */
  function mapPendingStudent(item: PendingStudentApiItem): PendingStudentItem {
    return {
      id: item.id,

      studentNo: item.student_no,

      name: item.name,

      email: item.email,

      applicationId: item.application_id,

      className: item.class_name,

      status: item.status,

      courseId: item.course_id,

      providerTeacherName: item.provider_teacher_name,

      hasAccount: item.has_account,
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

  return {
    /*
     * Stats
     */
    stats,
    statsLoading,
    fetchStats,

    /*
     * Teacher
     */
    teacherApplications,
    teacherApplicationsLoading,
    approvingTeacherId,
    fetchTeacherApplications,
    approveTeacherApplication,

    /*
     * Course
     */
    courses,
    coursesLoading,
    selectedCourseId,
    selectedCourse,
    fetchCourses,
    selectCourse,

    /*
     * Student
     */
    pendingStudents,
    studentsLoading,
    selectedStudentIds,
    studentSearchKeyword,
    pendingStudentTotal,
    pendingCourseIds,
    approvingStudents,
    pendingCourses,

    fetchStudentsForCourse,
    fetchPendingStudentTotal,
    searchStudents,
    clearStudentSearch,
    setSelectedStudentIds,
    clearStudentSelection,
    approveSelectedStudents,

    /*
     * Common
     */
    pendingCount,
    errorMessage,
    clearErrorMessage,

    initialize,
  };
}
