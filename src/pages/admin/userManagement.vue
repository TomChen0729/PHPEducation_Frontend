<template>
  <q-page class="user-management-page">
    <!-- 頁首 -->
    <header class="user-management-page__header">
      <div>
        <h3 class="user-management-page__title">使用者管理</h3>

        <p class="user-management-page__description">管理教師申請與學生帳號開通</p>
      </div>

      <q-badge
        v-if="pendingCount > 0"
        color="orange-4"
        class="user-management-page__pending-count"
        :label="`待處理 ${pendingCount} 件`"
      />
    </header>

    <!-- 統計 -->
    <UserStatsCards :stats="stats" />

    <!-- 管理區 -->
    <section class="user-management-page__panels">
      <!-- 教師申請核准 -->
      <TeacherApprovalPanel :applications="teacherApplications" @approve="requestApproveTeacher" />

      <!-- 學生帳號開通 -->
      <StudentActivationPanel
        :course-options="courseOptions"
        :selected-course-id="selectedCourseId"
        :search-keyword="studentSearchKeyword"
        :students="filteredPendingStudents"
        :selected-student-ids="selectedStudentIds"
        :selected-student-count="selectedStudentCount"
        :all-filtered-students-selected="allFilteredStudentsSelected"
        :loading="studentActivationLoading"
        @update:selected-course-id="selectedCourseId = $event"
        @update:search-keyword="studentSearchKeyword = $event"
        @toggle-student="toggleStudent"
        @toggle-select-all="toggleSelectAllStudents"
        @request-activate="requestStudentActivation"
      />
    </section>

    <!-- 共用確認視窗 -->
    <ConfirmDialog
      v-model="confirmDialog.open"
      :title="confirmDialog.title"
      :message="confirmDialog.message"
      :confirm-label="confirmDialog.confirmLabel"
      :confirm-color="confirmDialog.confirmColor"
      :loading="confirmLoading"
      @confirm="handleConfirm"
    />
  </q-page>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue';

import { Notify } from 'quasar';

import ConfirmDialog from '../../components/common/ConfirmDialog.vue';

import StudentActivationPanel from '../../components/admin/user-management/StudentActivationPanel.vue';
import TeacherApprovalPanel from '../../components/admin/user-management/TeacherApprovalPanel.vue';
import UserStatsCards from '../../components/admin/user-management/UserStatsCards.vue';

import { useUserManagement } from '../../composables/useUserManagement';

import type { TeacherApplication } from '../../types/teacher-application';

type ConfirmAction = 'approveTeacher' | 'activateStudents' | null;

const {
  /*
   * 原本使用者管理資料
   */
  teacherApplications,
  stats,
  pendingCount,

  /*
   * 教師核准
   */
  approveLoading,
  approveTeacherApplication,

  /*
   * 課程篩選
   */
  courseOptions,
  selectedCourseId,
  selectedCourse,

  /*
   * 學生搜尋
   */
  studentSearchKeyword,
  filteredPendingStudents,

  /*
   * 學生勾選
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
  activateSelectedStudents,
} = useUserManagement();

/*
 * 共用確認視窗狀態
 */
const confirmDialog = reactive({
  open: false,

  action: null as ConfirmAction,

  teacher: null as TeacherApplication | null,

  title: '',
  message: '',
  confirmLabel: '確定',
  confirmColor: 'primary',
});

/*
 * 根據目前操作決定
 * ConfirmDialog 要顯示哪一個 Loading
 */
const confirmLoading = computed(() => {
  switch (confirmDialog.action) {
    case 'approveTeacher':
      return approveLoading.value;

    case 'activateStudents':
      return studentActivationLoading.value;

    default:
      return false;
  }
});

/*
 * =========================
 * 教師帳號核准
 * =========================
 */

function requestApproveTeacher(teacher: TeacherApplication) {
  confirmDialog.action = 'approveTeacher';

  confirmDialog.teacher = teacher;

  confirmDialog.title = '核准教師申請';

  confirmDialog.message = `確定核准「${teacher.name}」的教師帳號申請？`;

  confirmDialog.confirmLabel = '核准';

  confirmDialog.confirmColor = 'primary';

  confirmDialog.open = true;
}

/*
 * =========================
 * 學生帳號開通
 * =========================
 */

function requestStudentActivation() {
  if (selectedStudentCount.value === 0) {
    return;
  }

  const courseName = selectedCourse.value?.courseName ?? '目前課程';

  confirmDialog.action = 'activateStudents';

  confirmDialog.teacher = null;

  confirmDialog.title = '開通學生帳號';

  confirmDialog.message = `確定要開通「${courseName}」的 ${selectedStudentCount.value} 位學生帳號嗎？`;

  confirmDialog.confirmLabel = '確定開通';

  confirmDialog.confirmColor = 'teal';

  confirmDialog.open = true;
}

/*
 * =========================
 * 確認操作
 * =========================
 */

async function handleConfirm() {
  switch (confirmDialog.action) {
    case 'approveTeacher':
      await approveTeacher();
      break;

    case 'activateStudents':
      await activateStudents();
      break;
  }
}

/*
 * =========================
 * 執行教師核准
 * =========================
 */

async function approveTeacher() {
  const teacher = confirmDialog.teacher;

  if (!teacher) {
    return;
  }

  const success = await approveTeacherApplication(teacher.id);

  if (!success) {
    return;
  }

  confirmDialog.open = false;

  Notify.create({
    type: 'positive',
    message: '教師帳號核准成功',
    position: 'top',
    timeout: 1500,
  });

  resetConfirmDialog();
}

/*
 * =========================
 * 執行學生帳號開通
 * =========================
 */

async function activateStudents() {
  if (selectedStudentCount.value === 0) {
    return;
  }

  /*
   * 先記錄數量。
   *
   * 因為 activateSelectedStudents()
   * 成功後會清空 selectedStudentIds。
   */
  const count = selectedStudentCount.value;

  const courseName = selectedCourse.value?.courseName ?? '目前課程';

  /*
   * 現階段為 Mock。
   *
   * Backend 完成後，
   * useUserManagement 內部再改成正式 API。
   */
  const success = await activateSelectedStudents();

  if (!success) {
    return;
  }

  confirmDialog.open = false;

  Notify.create({
    type: 'positive',
    message: `「${courseName}」已成功開通 ${count} 位學生帳號`,
    position: 'top',
    timeout: 1500,
  });

  resetConfirmDialog();
}

/*
 * 清除 ConfirmDialog 狀態
 */
function resetConfirmDialog() {
  confirmDialog.action = null;

  confirmDialog.teacher = null;

  confirmDialog.title = '';

  confirmDialog.message = '';

  confirmDialog.confirmLabel = '確定';

  confirmDialog.confirmColor = 'primary';
}
</script>
