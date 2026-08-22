import { computed, ref } from 'vue';

import axios from 'axios';

import { teacherApplicationApi } from '../api/teacher-application.api';

import type { TeacherApplication } from '../types/teacher-application';

import type { CourseActivationApplication, UserStats } from '../types/user-management';

export function useUserManagement() {
  /*
   * =========================
   * 教師帳號申請
   * =========================
   *
   * 正式 API
   */
  const teacherApplications = ref<TeacherApplication[]>([]);

  /*
   * 教師申請列表 Loading
   */
  const teacherApplicationsLoading = ref(false);

  /*
   * 教師核准 Loading
   */
  const approveLoading = ref(false);

  /*
   * =========================
   * 課程開通申請
   * =========================
   *
   * 目前 Backend 新版課程開通
   * 還沒有正式更新上來，
   * 所以這一區先繼續 Mock。
   */
  const courseActivationApplications = ref<CourseActivationApplication[]>([
    {
      id: 1,

      courseId: 1,
      courseName: '程式設計',
      semester: '115-1',

      teacherId: 1,
      teacherName: '許老師',

      studentCount: 32,

      status: 'pending',
    },
    {
      id: 2,

      courseId: 2,
      courseName: '資料庫系統',
      semester: '115-1',

      teacherId: 2,
      teacherName: '陳老師',

      studentCount: 28,

      status: 'pending',
    },
    {
      id: 3,

      courseId: 3,
      courseName: '網頁程式設計',
      semester: '114-2',

      teacherId: 3,
      teacherName: '林老師',

      studentCount: 41,

      status: 'pending',
    },
  ]);

  /*
   * 課程開通 Loading
   *
   * 記錄目前正在開通哪一筆。
   */
  const courseActivationLoadingId = ref<number | null>(null);

  /*
   * =========================
   * 統計資料
   * =========================
   *
   * 目前仍然 Mock。
   */
  const stats = ref<UserStats>({
    teacherCount: 8,
    studentCount: 216,
    currentSemesterCourseCount: 14,
  });

  /*
   * =========================
   * 共用錯誤訊息
   * =========================
   */
  const errorMessage = ref('');

  /*
   * =========================
   * 待處理總數
   * =========================
   *
   * 教師申請：
   * 真實 Backend 資料
   *
   * 課程開通：
   * 暫時 Mock
   */
  const pendingCount = computed(() => {
    return teacherApplications.value.length + courseActivationApplications.value.length;
  });

  /*
   * =========================
   * 取得教師申請列表
   * =========================
   */
  async function fetchTeacherApplications(): Promise<void> {
    teacherApplicationsLoading.value = true;

    errorMessage.value = '';

    try {
      const response = await teacherApplicationApi.list('pending');

      teacherApplications.value = response.data.applications;
    } catch (error: unknown) {
      errorMessage.value = getApiErrorMessage(error, '教師申請資料取得失敗');
    } finally {
      teacherApplicationsLoading.value = false;
    }
  }

  /*
   * =========================
   * 核准教師帳號
   * =========================
   */
  async function approveTeacherApplication(applicationId: number): Promise<boolean> {
    approveLoading.value = true;

    errorMessage.value = '';

    try {
      await teacherApplicationApi.approve(applicationId);

      /*
       * 核准成功後，
       * 從 Pending 清單移除。
       */
      teacherApplications.value = teacherApplications.value.filter(
        (application) => application.id !== applicationId,
      );

      return true;
    } catch (error: unknown) {
      errorMessage.value = getApiErrorMessage(error, '教師帳號核准失敗');

      return false;
    } finally {
      approveLoading.value = false;
    }
  }

  /*
   * =========================
   * 課程開通
   * =========================
   *
   * 暫時 Mock。
   *
   * 之後 Backend 正式版本：
   *
   * 管理員只負責核准課程。
   *
   * Backend：
   * 1. 判斷學生是否已有帳號
   * 2. 沒有 → 建立 Student
   * 3. 已有 → 沿用
   * 4. 建立 Enrollment
   */
  async function approveCourseActivation(applicationId: number): Promise<boolean> {
    courseActivationLoadingId.value = applicationId;

    errorMessage.value = '';

    try {
      /*
       * Mock API Delay
       */
      await new Promise((resolve) => {
        setTimeout(resolve, 500);
      });

      /*
       * 模擬開通成功：
       * 將該課程從待開通清單移除。
       */
      courseActivationApplications.value = courseActivationApplications.value.filter(
        (application) => application.id !== applicationId,
      );

      return true;
    } catch {
      errorMessage.value = '課程開通失敗';

      return false;
    } finally {
      courseActivationLoadingId.value = null;
    }
  }

  return {
    /*
     * 教師申請
     */
    teacherApplications,

    teacherApplicationsLoading,

    approveLoading,

    fetchTeacherApplications,
    approveTeacherApplication,

    /*
     * 課程開通
     */
    courseActivationApplications,

    courseActivationLoadingId,

    approveCourseActivation,

    /*
     * 統計 / 共用
     */
    stats,

    pendingCount,

    errorMessage,
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
