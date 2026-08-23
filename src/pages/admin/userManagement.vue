<template>
  <q-page class="user-management-page">
    <!-- =========================
         Header
    ========================== -->
    <header class="user-management-page__header">
      <div>
        <h3 class="user-management-page__title">使用者管理</h3>

        <p class="user-management-page__description">管理教師申請與學生帳號開通</p>
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
    <UserStatsCards :stats="stats" :loading="statsLoading" />

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
        :courses="courses"
        :selected-course-id="selectedCourseId"
        :selected-course="selectedCourse"
        :students="pendingStudents"
        :selected-student-ids="selectedStudentIds"
        :courses-loading="coursesLoading"
        :students-loading="studentsLoading"
        :approving-students="approvingStudents"
        :search-keyword="studentSearchKeyword"
        @select-course="handleSelectCourse"
        @search="handleSearchStudents"
        @clear-search="handleClearSearch"
        @update:selected-student-ids="setSelectedStudentIds"
        @request-approve="requestApproveStudents"
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

import UserStatsCards from '../../components/admin/user-management/UserStatsCards.vue';

import { useUserManagement } from '../../composables/useUserManagement';

import type { TeacherApplication } from '../../types/teacher-application';

type ConfirmAction = 'approveTeacher' | 'approveStudents' | null;

const {
  /*
   * Stats
   */
  stats,
  statsLoading,

  /*
   * Teacher
   */
  teacherApplications,
  teacherApplicationsLoading,
  approvingTeacherId,
  approveTeacherApplication,

  /*
   * Courses
   */
  courses,
  coursesLoading,
  selectedCourseId,
  selectedCourse,
  selectCourse,

  /*
   * Students
   */
  pendingStudents,
  studentsLoading,
  selectedStudentIds,
  studentSearchKeyword,
  approvingStudents,

  searchStudents,
  clearStudentSearch,
  setSelectedStudentIds,
  approveSelectedStudents,

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

    case 'approveStudents':
      return approvingStudents.value;

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
 * Course
 * ============================================================
 */
async function handleSelectCourse(courseId: number) {
  clearErrorMessage();

  await selectCourse(courseId);
}

/*
 * ============================================================
 * Search Student
 * ============================================================
 */
async function handleSearchStudents(keyword: string) {
  clearErrorMessage();

  await searchStudents(keyword);
}

async function handleClearSearch() {
  clearErrorMessage();

  await clearStudentSearch();
}

/*
 * ============================================================
 * Approve Students
 * ============================================================
 */
function requestApproveStudents() {
  if (selectedStudentIds.value.length === 0 || !selectedCourse.value) {
    return;
  }

  clearErrorMessage();

  confirmDialog.action = 'approveStudents';

  confirmDialog.teacher = null;

  confirmDialog.title = '確認開通學生';

  confirmDialog.message =
    `確定要開通「${selectedCourse.value.name}」中已選擇的 ` +
    `${selectedStudentIds.value.length} 位學生嗎？` +
    '尚未有帳號的學生會建立新帳號，所有選取學生都會加入此課程。';

  confirmDialog.confirmLabel = '確認開通';

  confirmDialog.confirmColor = 'teal';

  confirmDialog.open = true;
}

async function handleApproveStudents() {
  const result = await approveSelectedStudents();

  if (!result) {
    return;
  }

  confirmDialog.open = false;

  Notify.create({
    type: 'positive',

    message:
      `開通完成：共 ${result.activatedCount} 位，` +
      `新建立 ${result.createdCount} 個帳號，` +
      `${result.enrolledCount} 位已加入課程`,

    position: 'top',

    timeout: 2600,
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

    case 'approveStudents':
      await handleApproveStudents();

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
