import { computed, ref, watch } from 'vue';

import type { TeacherApplication } from '../types/teacher-application';

import type { CourseFilterOption, PendingStudentItem, UserStats } from '../types/user-management';

export function useUserManagement() {
  /*
   * =========================
   * 教師帳號申請
   * =========================
   *
   * 目前 Backend 尚未提供
   * GET 待審核教師申請清單 API，
   * 所以暫時使用 Mock Data。
   */
  const teacherApplications = ref<TeacherApplication[]>([
    {
      id: 1,
      name: '陳老師',
      account: 'chen@example.com',
      email: 'chen@example.com',
      reason: '申請教師帳號',
      status: 'pending',
    },
    {
      id: 2,
      name: '林老師',
      account: 'lin@example.com',
      email: 'lin@example.com',
      reason: '希望建立教學課程',
      status: 'pending',
    },
  ]);

  /*
   * 教師核准 Loading
   */
  const approveLoading = ref(false);

  /*
   * 使用者管理共用錯誤訊息
   */
  const errorMessage = ref('');

  /*
   * 暫時模擬教師核准。
   *
   * 等 Backend 提供 GET 待審核教師申請 API 後，
   * 再將教師清單與核准流程一起改成正式 API。
   */
  async function approveTeacherApplication(applicationId: number): Promise<boolean> {
    approveLoading.value = true;
    errorMessage.value = '';

    try {
      /*
       * Mock API Delay
       */
      await new Promise((resolve) => {
        setTimeout(resolve, 500);
      });

      /*
       * 模擬核准成功：
       * 將該教師從待審核清單移除。
       */
      teacherApplications.value = teacherApplications.value.filter(
        (application) => application.id !== applicationId,
      );

      return true;
    } catch {
      errorMessage.value = '教師帳號核准失敗';

      return false;
    } finally {
      approveLoading.value = false;
    }
  }

  /*
   * =========================
   * 學生帳號待開通
   * =========================
   *
   * Backend 支援 course_id 後，
   * 再替換成正式 API。
   */
  const pendingStudents = ref<PendingStudentItem[]>([
    {
      id: 1,
      studentNo: '1411131001',
      name: '王小明',
      providerTeacherName: '許老師',

      courseId: 1,
      courseName: '程式設計',
      semester: '115-1',
    },
    {
      id: 2,
      studentNo: '1411131002',
      name: '李小華',
      providerTeacherName: '許老師',

      courseId: 1,
      courseName: '程式設計',
      semester: '115-1',
    },
    {
      id: 3,
      studentNo: '1411131003',
      name: '陳小美',
      providerTeacherName: '許老師',

      courseId: 1,
      courseName: '程式設計',
      semester: '115-1',
    },

    {
      id: 4,
      studentNo: '1411132001',
      name: '林小安',
      providerTeacherName: '陳老師',

      courseId: 2,
      courseName: '資料庫系統',
      semester: '115-1',
    },
    {
      id: 5,
      studentNo: '1411132002',
      name: '張小華',
      providerTeacherName: '陳老師',

      courseId: 2,
      courseName: '資料庫系統',
      semester: '115-1',
    },

    {
      id: 6,
      studentNo: '1411133001',
      name: '黃小明',
      providerTeacherName: '林老師',

      courseId: 3,
      courseName: '網頁程式設計',
      semester: '114-2',
    },

    {
      id: 7,
      studentNo: '1411131001',
      name: '王小明',
      providerTeacherName: '許老師',

      courseId: 1,
      courseName: '程式設計',
      semester: '115-1',
    },
    {
      id: 8,
      studentNo: '1411131002',
      name: '李小華',
      providerTeacherName: '許老師',

      courseId: 1,
      courseName: '程式設計',
      semester: '115-1',
    },
    {
      id: 9,
      studentNo: '1411131003',
      name: '陳小美',
      providerTeacherName: '許老師',

      courseId: 1,
      courseName: '程式設計',
      semester: '115-1',
    },

    {
      id: 10,
      studentNo: '1411131001',
      name: '王小明',
      providerTeacherName: '許老師',

      courseId: 1,
      courseName: '程式設計',
      semester: '115-1',
    },
    {
      id: 11,
      studentNo: '1411131002',
      name: '李小華',
      providerTeacherName: '許老師',

      courseId: 1,
      courseName: '程式設計',
      semester: '115-1',
    },
    {
      id: 12,
      studentNo: '1411131003',
      name: '陳小美',
      providerTeacherName: '許老師',

      courseId: 1,
      courseName: '程式設計',
      semester: '115-1',
    },

    {
      id: 13,
      studentNo: '1411131001',
      name: '王小明',
      providerTeacherName: '許老師',

      courseId: 1,
      courseName: '程式設計',
      semester: '115-1',
    },
    {
      id: 14,
      studentNo: '1411131002',
      name: '李小華',
      providerTeacherName: '許老師',

      courseId: 1,
      courseName: '程式設計',
      semester: '115-1',
    },
    {
      id: 15,
      studentNo: '1411131003',
      name: '陳小美',
      providerTeacherName: '許老師',

      courseId: 1,
      courseName: '程式設計',
      semester: '115-1',
    },
  ]);

  /*
   * =========================
   * 統計資料
   * =========================
   *
   * 暫時 Mock。
   */
  const stats = ref<UserStats>({
    teacherCount: 8,
    studentCount: 216,
    currentSemesterCourseCount: 14,
  });

  /*
   * =========================
   * 課程篩選
   * =========================
   */

  const selectedCourseId = ref<number | null>(null);

  /*
   * 搜尋學生
   */
  const studentSearchKeyword = ref('');

  /*
   * 已勾選學生 ID
   */
  const selectedStudentIds = ref<number[]>([]);

  /*
   * 學生開通 Loading
   */
  const studentActivationLoading = ref(false);

  /*
   * =========================
   * 課程選項
   * =========================
   *
   * 暫時從 pendingStudents
   * 自動整理出不重複課程。
   */
  const courseOptions = computed<CourseFilterOption[]>(() => {
    const courseMap = new Map<number, CourseFilterOption>();

    for (const student of pendingStudents.value) {
      if (courseMap.has(student.courseId)) {
        continue;
      }

      courseMap.set(student.courseId, {
        value: student.courseId,

        label: `${formatSemester(student.semester)}－${student.courseName}`,
      });
    }

    return Array.from(courseMap.values());
  });

  /*
   * =========================
   * 目前選擇的課程
   * =========================
   */
  const selectedCourse = computed(() => {
    if (selectedCourseId.value === null) {
      return null;
    }

    return (
      pendingStudents.value.find((student) => student.courseId === selectedCourseId.value) ?? null
    );
  });

  /*
   * =========================
   * 學生篩選
   * =========================
   *
   * 1. 課程
   * 2. 學號 / 姓名
   */
  const filteredPendingStudents = computed(() => {
    if (selectedCourseId.value === null) {
      return [];
    }

    const keyword = studentSearchKeyword.value.trim().toLowerCase();

    return pendingStudents.value.filter((student) => {
      /*
       * 先確認是否屬於目前課程
       */
      const belongsToCourse = student.courseId === selectedCourseId.value;

      if (!belongsToCourse) {
        return false;
      }

      /*
       * 沒有搜尋關鍵字時，
       * 顯示該課程全部學生。
       */
      if (!keyword) {
        return true;
      }

      /*
       * 搜尋學號或姓名
       */
      return (
        student.studentNo.toLowerCase().includes(keyword) ||
        student.name.toLowerCase().includes(keyword)
      );
    });
  });

  /*
   * =========================
   * 是否全選
   * =========================
   *
   * 只判斷目前篩選後
   * 顯示在畫面上的學生。
   */
  const allFilteredStudentsSelected = computed(() => {
    if (filteredPendingStudents.value.length === 0) {
      return false;
    }

    return filteredPendingStudents.value.every((student) =>
      selectedStudentIds.value.includes(student.id),
    );
  });

  /*
   * =========================
   * 已選學生數量
   * =========================
   */
  const selectedStudentCount = computed(() => {
    return selectedStudentIds.value.length;
  });

  /*
   * =========================
   * Pending 總數
   * =========================
   */
  const pendingCount = computed(() => {
    return teacherApplications.value.length + pendingStudents.value.length;
  });

  /*
   * =========================
   * 切換課程
   * =========================
   *
   * 避免上一門課勾選的學生
   * 被保留到下一門課。
   */
  watch(selectedCourseId, () => {
    selectedStudentIds.value = [];
    studentSearchKeyword.value = '';
  });

  /*
   * =========================
   * 單一學生勾選
   * =========================
   */
  function toggleStudent(studentId: number) {
    if (selectedStudentIds.value.includes(studentId)) {
      selectedStudentIds.value = selectedStudentIds.value.filter((id) => id !== studentId);

      return;
    }

    selectedStudentIds.value = [...selectedStudentIds.value, studentId];
  }

  /*
   * =========================
   * 全選 / 取消全選
   * =========================
   *
   * 只處理目前畫面上
   * 篩選後的學生。
   */
  function toggleSelectAllStudents() {
    const visibleIds = filteredPendingStudents.value.map((student) => student.id);

    /*
     * 已全選
     * → 取消目前畫面學生
     */
    if (allFilteredStudentsSelected.value) {
      selectedStudentIds.value = selectedStudentIds.value.filter((id) => !visibleIds.includes(id));

      return;
    }

    /*
     * 尚未全選
     * → 加入目前畫面全部學生
     */
    selectedStudentIds.value = [...new Set([...selectedStudentIds.value, ...visibleIds])];
  }

  /*
   * =========================
   * 清除學生選擇
   * =========================
   */
  function clearStudentSelection() {
    selectedStudentIds.value = [];
  }

  /*
   * =========================
   * 學生帳號開通
   * =========================
   *
   * 目前為 Mock。
   *
   * Backend 完成：
   * course_id
   * 學生帳號核准
   * Enrollment
   *
   * 之後再改成正式 API。
   */
  async function activateSelectedStudents(): Promise<boolean> {
    if (selectedStudentIds.value.length === 0) {
      return false;
    }

    studentActivationLoading.value = true;

    errorMessage.value = '';

    try {
      /*
       * Mock API Delay
       */
      await new Promise((resolve) => {
        setTimeout(resolve, 500);
      });

      /*
       * 模擬開通完成：
       *
       * 將已開通學生
       * 從 pendingStudents 移除。
       */
      pendingStudents.value = pendingStudents.value.filter(
        (student) => !selectedStudentIds.value.includes(student.id),
      );

      clearStudentSelection();

      return true;
    } catch {
      errorMessage.value = '學生帳號開通失敗';

      return false;
    } finally {
      studentActivationLoading.value = false;
    }
  }

  /*
   * =========================
   * Return
   * =========================
   */
  return {
    /*
     * 教師
     */
    teacherApplications,

    approveLoading,
    approveTeacherApplication,

    /*
     * 學生
     */
    pendingStudents,

    /*
     * 統計
     */
    stats,

    /*
     * 共用
     */
    pendingCount,
    errorMessage,

    /*
     * 課程
     */
    courseOptions,
    selectedCourseId,
    selectedCourse,

    /*
     * 搜尋
     */
    studentSearchKeyword,
    filteredPendingStudents,

    /*
     * 學生選取
     */
    selectedStudentIds,
    selectedStudentCount,
    allFilteredStudentsSelected,

    /*
     * 學生開通
     */
    studentActivationLoading,

    toggleStudent,
    toggleSelectAllStudents,

    clearStudentSelection,
    activateSelectedStudents,
  };
}

/*
 * =========================
 * 學期格式化
 * =========================
 *
 * 115-1
 * ↓
 * 115 學年度・上學期
 */
function formatSemester(semester: string) {
  const [year, term] = semester.split('-');

  const termText = term === '1' ? '上學期' : term === '2' ? '下學期' : '';

  return `${year} 學年度・${termText}`;
}
