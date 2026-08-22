<template>
  <q-page class="user-management-page">
    <!-- =========================
         頁首
    ========================== -->
    <header class="user-management-page__header">
      <div>
        <h3 class="user-management-page__title">使用者管理</h3>

        <p class="user-management-page__description">管理教師申請與課程開通</p>
      </div>

      <q-badge
        v-if="pendingCount > 0"
        color="orange-4"
        class="user-management-page__pending-count"
        :label="`待處理 ${pendingCount} 件`"
      />
    </header>

    <!-- =========================
         統計
    ========================== -->
    <UserStatsCards :stats="stats" />

    <!-- =========================
         Error
    ========================== -->
    <q-banner v-if="errorMessage" rounded class="bg-red-1 text-negative q-mb-md">
      {{ errorMessage }}
    </q-banner>

    <!-- =========================
         管理區域
    ========================== -->
    <section class="user-management-page__panels">
      <!-- 教師申請 -->
      <div class="relative-position">
        <TeacherApprovalPanel
          :applications="teacherApplications"
          @approve="requestApproveTeacher"
        />

        <!-- 教師列表第一次載入 -->
        <q-inner-loading :showing="teacherApplicationsLoading">
          <q-spinner color="primary" size="40px" />
        </q-inner-loading>
      </div>

      <!-- 課程開通 -->
      <CourseActivationPanel
        :applications="courseActivationApplications"
        :loading-application-id="courseActivationLoadingId"
        @view-students="handleViewStudents"
        @request-approve="requestCourseActivation"
      />
    </section>

    <!-- =========================
         共用 Confirm Dialog
    ========================== -->
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
import { computed, onMounted, reactive } from 'vue';

import { Notify } from 'quasar';

import ConfirmDialog from '../../components/common/ConfirmDialog.vue';

import CourseActivationPanel from '../../components/admin/user-management/CourseActivationPanel.vue';

import TeacherApprovalPanel from '../../components/admin/user-management/TeacherApprovalPanel.vue';

import UserStatsCards from '../../components/admin/user-management/UserStatsCards.vue';

import { useUserManagement } from '../../composables/useUserManagement';

import type { TeacherApplication } from '../../types/teacher-application';

import type { CourseActivationApplication } from '../../types/user-management';

type ConfirmAction = 'approveTeacher' | 'activateCourse' | null;

const {
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
} = useUserManagement();

/*
 * =========================
 * Confirm Dialog
 * =========================
 */
const confirmDialog = reactive({
  open: false,

  action: null as ConfirmAction,

  teacher: null as TeacherApplication | null,

  courseApplication: null as CourseActivationApplication | null,

  title: '',

  message: '',

  confirmLabel: '確定',

  confirmColor: 'primary',
});

/*
 * =========================
 * Dialog Loading
 * =========================
 */
const confirmLoading = computed(() => {
  switch (confirmDialog.action) {
    case 'approveTeacher':
      return approveLoading.value;

    case 'activateCourse':
      return courseActivationLoadingId.value !== null;

    default:
      return false;
  }
});

/*
 * =========================
 * 頁面初始化
 * =========================
 *
 * 正式取得 Pending 教師申請。
 */
onMounted(() => {
  void fetchTeacherApplications();
});

/*
 * =========================
 * 教師核准
 * =========================
 */
function requestApproveTeacher(teacher: TeacherApplication) {
  confirmDialog.action = 'approveTeacher';

  confirmDialog.teacher = teacher;

  confirmDialog.courseApplication = null;

  confirmDialog.title = '核准教師申請';

  confirmDialog.message = `確定核准「${teacher.name}」的教師帳號申請？`;

  confirmDialog.confirmLabel = '核准';

  confirmDialog.confirmColor = 'primary';

  confirmDialog.open = true;
}

/*
 * =========================
 * 課程開通
 * =========================
 */
function requestCourseActivation(application: CourseActivationApplication) {
  confirmDialog.action = 'activateCourse';

  confirmDialog.teacher = null;

  confirmDialog.courseApplication = application;

  confirmDialog.title = '確認開通課程';

  /*
   * 維持你現在的 Dialog 內容，
   * 不另外修改。
   */
  confirmDialog.message =
    `確定要開通「${application.courseName}」嗎？` +
    `此課程共有 ${application.studentCount} 位學生。` +
    '系統將自動為尚未有帳號的學生建立帳號，並將學生加入此課程。';

  confirmDialog.confirmLabel = '確認開通';

  confirmDialog.confirmColor = 'teal';

  confirmDialog.open = true;
}

/*
 * =========================
 * 檢視學生
 * =========================
 *
 * 目前仍維持 Mock / 暫時提示。
 * 之後等新的 Course-based API。
 */
function handleViewStudents(application: CourseActivationApplication) {
  Notify.create({
    type: 'info',

    message: `「${application.courseName}」共有 ` + `${application.studentCount} 位學生`,

    position: 'top',

    timeout: 2000,
  });
}

/*
 * =========================
 * Confirm
 * =========================
 */
async function handleConfirm() {
  switch (confirmDialog.action) {
    case 'approveTeacher':
      await approveTeacher();

      break;

    case 'activateCourse':
      await activateCourse();

      break;
  }
}

/*
 * =========================
 * 正式核准教師
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
 * 課程開通 Mock
 * =========================
 */
async function activateCourse() {
  const application = confirmDialog.courseApplication;

  if (!application) {
    return;
  }

  const success = await approveCourseActivation(application.id);

  if (!success) {
    return;
  }

  confirmDialog.open = false;

  Notify.create({
    type: 'positive',

    message: `「${application.courseName}」開通成功`,

    position: 'top',

    timeout: 1500,
  });

  resetConfirmDialog();
}

/*
 * =========================
 * Reset Dialog
 * =========================
 */
function resetConfirmDialog() {
  confirmDialog.action = null;

  confirmDialog.teacher = null;

  confirmDialog.courseApplication = null;

  confirmDialog.title = '';

  confirmDialog.message = '';

  confirmDialog.confirmLabel = '確定';

  confirmDialog.confirmColor = 'primary';
}
</script>
