<template>
  <q-page class="user-management-page">
    <!-- =========================
         Header
    ========================== -->
    <header class="user-management-page__header">
      <div>
        <h3 class="user-management-page__title">使用者管理</h3>

        <p class="user-management-page__description">管理教師申請與課程開通</p>
      </div>

      <q-badge
        v-if="pendingCount > 0"
        color="orange-4"
        text-color="dark"
        class="user-management-page__pending-count"
        :label="`待處理 ${pendingCount} 件`"
      />
    </header>

    <!-- =========================
         Stats
    ========================== -->
    <!-- <UserStatsCards :stats="stats" :loading="statsLoading" /> -->

    <!-- =========================
         Error
    ========================== -->
    <q-banner v-if="errorMessage" rounded class="bg-red-1 text-negative q-mb-md">
      <template #avatar>
        <q-icon name="error_outline" color="negative" />
      </template>

      {{ errorMessage }}

      <template #action>
        <q-btn flat dense color="negative" icon="close" @click="clearErrorMessage" />
      </template>
    </q-banner>

    <!-- =========================
         Panels
    ========================== -->
    <section class="user-management-page__panels">
      <!-- Teacher -->
      <TeacherApprovalPanel
        :applications="teacherApplications"
        :loading="teacherApplicationsLoading"
        :approving-teacher-id="approvingTeacherId"
        @approve="requestApproveTeacher"
      />

      <!-- Student -->
      <CourseActivationPanel
        :courses="pendingCourses"
        :selected-course-ids="selectedPendingCourseIds"
        :pending-student-count-by-course="pendingStudentCountByCourse"
        :selected-student-total="selectedPendingStudentTotal"
        :loading="coursesLoading || pendingCoursesLoading"
        :approving="approvingCourses"
        @update:selected-course-ids="setSelectedPendingCourseIds"
        @request-approve="requestApproveCourses"
      />
    </section>

    <!-- =========================
         Confirm Dialog
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

// import UserStatsCards from '../../components/admin/user-management/UserStatsCards.vue';

import { useUserManagement } from '../../composables/useUserManagement.js';

import type { TeacherApplication } from '../../types/teacher-application.js';

type ConfirmAction = 'approveTeacher' | 'approveCourses' | null;

const {
  /*
   * Stats
   */
  // stats,
  // statsLoading,

  /*
   * Teacher
   */
  teacherApplications,
  teacherApplicationsLoading,
  approvingTeacherId,
  approveTeacherApplication,

  /*
   * Course Activation
   */
  coursesLoading,
  pendingCoursesLoading,

  pendingCourses,

  pendingStudentCountByCourse,

  selectedPendingCourseIds,
  selectedPendingCourses,
  selectedPendingStudentTotal,

  approvingCourses,

  setSelectedPendingCourseIds,

  approveSelectedPendingCourses,

  /*
   * Common
   */
  pendingCount,
  errorMessage,
  clearErrorMessage,

  initialize,
} = useUserManagement();

/*
 * ============================================================
 * Confirm Dialog
 * ============================================================
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

const confirmLoading = computed(() => {
  switch (confirmDialog.action) {
    case 'approveTeacher':
      return approvingTeacherId.value !== null;

    case 'approveCourses':
      return approvingCourses.value;

    default:
      return false;
  }
});

/*
 * ============================================================
 * Init
 * ============================================================
 */
onMounted(() => {
  void initialize();
});

/*
 * ============================================================
 * Teacher
 * ============================================================
 */
function requestApproveTeacher(teacher: TeacherApplication) {
  clearErrorMessage();

  confirmDialog.action = 'approveTeacher';

  confirmDialog.teacher = teacher;

  confirmDialog.title = '核准教師申請';

  confirmDialog.message = `確定核准「${teacher.name}」的教師帳號申請？`;

  confirmDialog.confirmLabel = '核准';

  confirmDialog.confirmColor = 'primary';

  confirmDialog.open = true;
}

async function handleApproveTeacher() {
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

    message: `「${teacher.name}」教師帳號核准成功`,

    position: 'top',

    timeout: 1600,
  });

  resetConfirmDialog();
}

/*
 * ============================================================
 * Approve Courses
 * ============================================================
 */
function requestApproveCourses() {
  if (selectedPendingCourseIds.value.length === 0) {
    return;
  }

  clearErrorMessage();

  /*
   * Dialog 最多先顯示前三門課名。
   */
  const coursePreview = selectedPendingCourses.value
    .slice(0, 3)
    .map((course) => `「${course.name}」`)
    .join('、');

  const extraCount = Math.max(0, selectedPendingCourses.value.length - 3);

  const extraText = extraCount > 0 ? `等 ${selectedPendingCourses.value.length} 門課程` : '';

  confirmDialog.action = 'approveCourses';

  confirmDialog.teacher = null;

  confirmDialog.title = '確認開通課程';

  confirmDialog.message =
    `確定要開通 ${coursePreview}${extraText}？` +
    `本次共選擇 ${selectedPendingCourseIds.value.length} 門課程，` +
    `約包含 ${selectedPendingStudentTotal.value} 筆待審核學生資料。` +
    '每門課程會開通自己的待審核學生。';

  confirmDialog.confirmLabel = '確認開通';

  confirmDialog.confirmColor = 'teal';

  confirmDialog.open = true;
}

async function handleApproveCourses() {
  const result = await approveSelectedPendingCourses();

  if (!result) {
    return;
  }

  confirmDialog.open = false;

  Notify.create({
    type: 'positive',

    message:
      `已開通 ${result.courseCount} 門課程：` +
      `處理 ${result.activatedCount} 筆學生資料，` +
      `新建立 ${result.createdCount} 個帳號，` +
      `新增 ${result.enrolledCount} 筆選課`,

    position: 'top',

    timeout: 3200,
  });

  resetConfirmDialog();
}

/*
 * ============================================================
 * Confirm
 * ============================================================
 */
async function handleConfirm() {
  switch (confirmDialog.action) {
    case 'approveTeacher':
      await handleApproveTeacher();

      break;

    case 'approveCourses':
      await handleApproveCourses();

      break;
  }
}

/*
 * ============================================================
 * Reset
 * ============================================================
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
