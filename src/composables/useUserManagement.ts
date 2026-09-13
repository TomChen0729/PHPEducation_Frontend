import { computed, ref } from 'vue';

import axios from 'axios';

import { adminUserManagementApi } from '../api/admin-user-management.api';

import type { TeacherApplication } from '../types/teacher-application';

import type { AdminCourse, AdminCourseApiItem, UserStats } from '../types/user-management';

export function useUserManagement() {
  /*
   * ============================================================
   * Common
   * ============================================================
   */
  const errorMessage = ref('');

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

  const approvingTeacherId = ref<number | null>(null);

  /*
   * ============================================================
   * Course Activation
   * ============================================================
   */
  const courses = ref<AdminCourse[]>([]);

  const coursesLoading = ref(false);

  /*
   * 目前有 Pending Student 的來源課程 ID。
   */
  const pendingCourseIds = ref<number[]>([]);

  const pendingCoursesLoading = ref(false);

  /*
   * 每一門課目前有多少位待審核學生。
   *
   * Example：
   *
   * {
   *   1: 35,
   *   2: 28,
   * }
   */
  const pendingStudentCountByCourse = ref<Record<number, number>>({});

  /*
   * 管理員 Checkbox 目前勾選的課程 ID。
   */
  const selectedPendingCourseIds = ref<number[]>([]);

  /*
   * 課程開通 Loading。
   */
  const approvingCourses = ref(false);

  /*
   * ============================================================
   * Computed
   * ============================================================
   */

  /*
   * 只顯示目前真的還有 Pending Student 的課程。
   */
  const pendingCourses = computed<AdminCourse[]>(() => {
    const idSet = new Set(pendingCourseIds.value);

    return courses.value.filter((course) => {
      return idSet.has(course.id);
    });
  });

  /*
   * 目前被管理員勾選的課程資料。
   */
  const selectedPendingCourses = computed<AdminCourse[]>(() => {
    const idSet = new Set(selectedPendingCourseIds.value);

    return pendingCourses.value.filter((course) => {
      return idSet.has(course.id);
    });
  });

  /*
   * 已勾選課程總共有多少筆 Pending Student。
   *
   * 注意：
   * 這裡代表「待審核學生資料筆數」，
   * 不一定等於不重複學生人數。
   */
  const selectedPendingStudentTotal = computed<number>(() => {
    return selectedPendingCourseIds.value.reduce((total, courseId) => {
      return total + (pendingStudentCountByCourse.value[courseId] ?? 0);
    }, 0);
  });

  /*
   * 管理員首頁「待處理」數量。
   *
   * 一筆教師申請算 1 件。
   * 一門待開通課程算 1 件。
   */
  const pendingCount = computed<number>(() => {
    return teacherApplications.value.length + pendingCourses.value.length;
  });

  /*
   * ============================================================
   * Initialize
   * ============================================================
   */
  async function initialize(): Promise<void> {
    errorMessage.value = '';

    /*
     * courses 與 pending applications 可以平行取得。
     *
     * pendingCourses 是 computed，
     * 等兩邊資料回來後會自動更新。
     */
    await Promise.all([
      fetchStats(),
      fetchTeacherApplications(),
      fetchCourses(),
      fetchPendingCourses(),
    ]);
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
       * 成功後直接從 Pending List 移除。
       */
      teacherApplications.value = teacherApplications.value.filter(
        (application) => application.id !== applicationId,
      );

      /*
       * 教師總數會改變，所以重新取得統計。
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

      courses.value = response.data.courses.map((course: AdminCourseApiItem): AdminCourse => ({
        id: course.id,
        name: course.name,
        description: course.description,
        semester: course.semester,
        class_name: course.class_name,
        teacherId: course.teacher_id,
        teacherName: course.teacher_name,
      }));
    } catch (error: unknown) {
      setError(error, '課程資料取得失敗');
    } finally {
      coursesLoading.value = false;
    }
  }

  /*
   * ============================================================
   * Pending Courses
   * ============================================================
   */
  async function fetchPendingCourses(): Promise<void> {
    pendingCoursesLoading.value = true;

    try {
      /*
       * 一次取得全部 Pending Student Applications。
       *
       * Backend 回傳的是學生明細，
       * Frontend 再依 course_id 分組。
       */
      const response = await adminUserManagementApi.getStudentApplications({
        status: 'pending',
      });

      const counts: Record<number, number> = {};

      for (const item of response.data.items) {
        /*
         * 理論上 Pending Application 應該都有 course_id。
         * 為避免異常資料造成錯誤，仍先略過 null。
         */
        if (item.course_id === null) {
          continue;
        }

        counts[item.course_id] = (counts[item.course_id] ?? 0) + 1;
      }

      /*
       * 儲存每一門課 Pending Student 數量。
       */
      pendingStudentCountByCourse.value = counts;

      /*
       * counts 的 key 就是目前待開通課程。
       */
      pendingCourseIds.value = Object.keys(counts).map(Number);

      /*
       * 如果某門課已經被其他操作開通完成，
       * Refresh 後從 selected 中自動移除。
       */
      const pendingIdSet = new Set(pendingCourseIds.value);

      selectedPendingCourseIds.value = selectedPendingCourseIds.value.filter((courseId) => {
        return pendingIdSet.has(courseId);
      });
    } catch (error: unknown) {
      pendingCourseIds.value = [];

      pendingStudentCountByCourse.value = {};

      selectedPendingCourseIds.value = [];

      setError(error, '待開通課程資料取得失敗');
    } finally {
      pendingCoursesLoading.value = false;
    }
  }

  /*
   * ============================================================
   * Course Checkbox
   * ============================================================
   */

  /*
   * 直接更新 Checkbox 選取結果。
   *
   * 只允許目前 Pending Course ID 進入 Selected。
   */
  function setSelectedPendingCourseIds(ids: number[]) {
    const pendingIdSet = new Set(pendingCourseIds.value);

    selectedPendingCourseIds.value = [
      ...new Set(
        ids.filter((courseId) => {
          return pendingIdSet.has(courseId);
        }),
      ),
    ];
  }

  /*
   * 單一課程 Checkbox。
   */
  function togglePendingCourse(courseId: number, selected: boolean) {
    const idSet = new Set(selectedPendingCourseIds.value);

    if (selected) {
      idSet.add(courseId);
    } else {
      idSet.delete(courseId);
    }

    setSelectedPendingCourseIds([...idSet]);
  }

  /*
   * 全選目前所有待開通課程。
   */
  function selectAllPendingCourses() {
    selectedPendingCourseIds.value = pendingCourses.value.map((course) => course.id);
  }

  /*
   * 清除全部 Checkbox。
   */
  function clearPendingCourseSelection() {
    selectedPendingCourseIds.value = [];
  }

  /*
   * ============================================================
   * Approve Selected Pending Courses
   * ============================================================
   *
   * Backend 目前一次使用一個：
   *
   * source_course_id
   *
   * 所以：
   *
   * Admin 勾選：
   *
   * PHP
   * Database
   * Web
   *
   * Frontend 會循序送三次 API。
   *
   * PHP：
   * {
   *   source_course_id: 1,
   *   course_ids: [1]
   * }
   *
   * Database：
   * {
   *   source_course_id: 2,
   *   course_ids: [2]
   * }
   */
  async function approveSelectedPendingCourses(): Promise<{
    courseCount: number;

    activatedCount: number;

    createdCount: number;

    enrolledCount: number;
  } | null> {
    /*
     * 再次去重。
     */
    const courseIds = [...new Set(selectedPendingCourseIds.value)];

    if (courseIds.length === 0) {
      return null;
    }

    approvingCourses.value = true;

    errorMessage.value = '';

    let completedCourseCount = 0;

    let activatedCount = 0;

    let createdCount = 0;

    let enrolledCount = 0;

    try {
      /*
       * 不使用 Promise.all。
       *
       * 原因：
       * 同一位學生有可能同時出現在不同課程申請。
       *
       * 第一門課可能建立 students 帳號，
       * 後面的課只需要建立 enrollment。
       *
       * 循序執行可以避免同時建立同一學生帳號。
       */
      for (const courseId of courseIds) {
        const response = await adminUserManagementApi.approveCourses({
          source_course_id: courseId,

          /*
           * 目前需求：
           *
           * 每一門來源課程的學生，
           * 開通到自己的來源課程。
           */
          course_ids: [courseId],
        });

        completedCourseCount += 1;

        activatedCount += response.data.activated_count;

        createdCount += response.data.created_count;

        enrolledCount += response.data.enrolled_count;
      }

      /*
       * 全部成功後取消 Checkbox。
       */
      clearPendingCourseSelection();

      /*
       * 重新取得：
       *
       * - Pending Courses
       * - 系統統計
       *
       * 已經沒有 Pending Student 的課程
       * 就會自動畫面消失。
       */
      await Promise.all([fetchPendingCourses(), fetchStats()]);

      return {
        courseCount: completedCourseCount,

        activatedCount,

        createdCount,

        enrolledCount,
      };
    } catch (error: unknown) {
      /*
       * 假設：
       *
       * PHP 成功
       * Database 成功
       * Web 失敗
       *
       * 前面成功的 Backend 資料不會 Rollback。
       *
       * 所以這裡先重新抓最新狀態，
       * 避免畫面還顯示已成功的課程。
       */
      await Promise.all([fetchPendingCourses(), fetchStats()]);

      if (completedCourseCount > 0) {
        setError(
          error,
          `已完成 ${completedCourseCount} 門課程，但後續課程開通失敗，請確認待開通清單後再試一次`,
        );
      } else {
        setError(error, '課程開通失敗');
      }

      return null;
    } finally {
      approvingCourses.value = false;
    }
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

    /*
     * Laravel Validation：
     *
     * {
     *   message: "...",
     *   errors: {
     *     course_ids: ["..."]
     *   }
     * }
     */
    const validationMessage = data?.errors
      ? Object.values(data.errors).flat().find(Boolean)
      : undefined;

    return validationMessage ?? data?.message ?? fallback;
  }

  /*
   * ============================================================
   * Return
   * ============================================================
   */
  return {
    /*
     * Stats
     */
    stats,

    statsLoading,

    fetchStats,

    /*
     * Teacher Applications
     */
    teacherApplications,

    teacherApplicationsLoading,

    approvingTeacherId,

    fetchTeacherApplications,

    approveTeacherApplication,

    /*
     * All Courses
     */
    courses,

    coursesLoading,

    fetchCourses,

    /*
     * Pending Courses
     */
    pendingCourses,

    pendingCourseIds,

    pendingCoursesLoading,

    pendingStudentCountByCourse,

    fetchPendingCourses,

    /*
     * Checkbox
     */
    selectedPendingCourseIds,

    selectedPendingCourses,

    selectedPendingStudentTotal,

    setSelectedPendingCourseIds,

    togglePendingCourse,

    selectAllPendingCourses,

    clearPendingCourseSelection,

    /*
     * Approve
     */
    approvingCourses,

    approveSelectedPendingCourses,

    /*
     * Common
     */
    pendingCount,

    errorMessage,

    clearErrorMessage,

    /*
     * Init
     */
    initialize,
  };
}
