import { computed, ref } from 'vue';

import { teacherApplicationApi } from '../api/teacher-application.api';

import type { TeacherApplication } from '../types/teacher-application';

import type { PendingStudentItem, UserStats } from '../types/user-management';

export function useUserManagement() {
  /*
   * 暫時刻板資料。
   * Backend 提供 GET API 後直接替換。
   */
  const teacherApplications = ref<TeacherApplication[]>([
    {
      id: 1,
      name: '陳老師',
      email: 'chen@example.com',
      reason: '申請教師帳號',
      status: 'pending',
    },
    {
      id: 2,
      name: '林老師',
      email: 'lin@example.com',
      reason: '希望建立教學課程',
      status: 'pending',
    },
  ]);

  const pendingStudents = ref<PendingStudentItem[]>([
    {
      id: 1,
      studentNo: '1411131001',
      name: '王小明',
      providerTeacherName: '許老師',
    },
    {
      id: 2,
      studentNo: '1411131002',
      name: '李小華',
      providerTeacherName: '許老師',
    },
    {
      id: 3,
      studentNo: '1411131003',
      name: '陳小美',
      providerTeacherName: '林老師',
    },
    {
      id: 4,
      studentNo: '1411131001',
      name: '王小明',
      providerTeacherName: '許老師',
    },
    {
      id: 5,
      studentNo: '1411131002',
      name: '李小華',
      providerTeacherName: '許老師',
    },
    {
      id: 6,
      studentNo: '1411131003',
      name: '陳小美',
      providerTeacherName: '林老師',
    },
    {
      id: 7,
      studentNo: '1411131001',
      name: '王小明',
      providerTeacherName: '許老師',
    },
    {
      id: 8,
      studentNo: '1411131002',
      name: '李小華',
      providerTeacherName: '許老師',
    },
    {
      id: 9,
      studentNo: '1411131003',
      name: '陳小美',
      providerTeacherName: '林老師',
    },
  ]);

  /*
   * 暫時顯示資料。
   * 等 Backend 提供統計 API 後替換。
   */
  const stats = ref<UserStats>({
    teacherCount: 8,
    studentCount: 216,
    currentSemesterCourseCount: 14,
  });

  const selectedStudentIds = ref<number[]>([]);

  const approveLoading = ref(false);
  const errorMessage = ref('');

  const pendingCount = computed(() => {
    return teacherApplications.value.length + pendingStudents.value.length;
  });

  async function approveTeacherApplication(applicationId: number): Promise<boolean> {
    approveLoading.value = true;
    errorMessage.value = '';

    try {
      await teacherApplicationApi.approve(applicationId);

      return true;
    } catch {
      errorMessage.value = '教師帳號核准失敗';

      return false;
    } finally {
      approveLoading.value = false;
    }
  }

  function clearStudentSelection() {
    selectedStudentIds.value = [];
  }

  return {
    teacherApplications,
    pendingStudents,
    stats,

    selectedStudentIds,

    pendingCount,
    approveLoading,
    errorMessage,

    approveTeacherApplication,
    clearStudentSelection,
  };
}
