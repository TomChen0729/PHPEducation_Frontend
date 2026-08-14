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

    <!-- 錯誤 -->
    <q-banner
      v-if="errorMessage"
      rounded
      class="user-management-page__error bg-red-1 text-negative"
    >
      {{ errorMessage }}
    </q-banner>

    <!-- 管理區 -->
    <section class="user-management-page__panels">
      <TeacherApprovalPanel :applications="teacherApplications" @approve="requestApproveTeacher" />

      <StudentActivationPanel
        v-model:selected-ids="selectedStudentIds"
        :students="pendingStudents"
        @activate="requestActivateStudents"
      />
    </section>

    <!-- 執行確認 -->
    <ConfirmDialog
      v-model="confirmDialog.open"
      :title="confirmDialog.title"
      :message="confirmDialog.message"
      :confirm-label="confirmDialog.confirmLabel"
      :confirm-color="confirmDialog.confirmColor"
      :loading="approveLoading"
      @confirm="handleConfirm"
    />

    <!-- 教師帳號建立結果 -->
    <TeacherAccountResultDialog
      v-if="teacherAccountDialog.result"
      v-model="teacherAccountDialog.open"
      :teacher-name="teacherAccountDialog.teacherName"
      :result="teacherAccountDialog.result"
      @close="clearTeacherAccountResult"
    />
  </q-page>
</template>

<script setup lang="ts">
import { reactive } from 'vue';

import ConfirmDialog from '../../components/common/ConfirmDialog.vue';

import StudentActivationPanel from '../../components/admin/user-management/StudentActivationPanel.vue';
import TeacherAccountResultDialog from '../../components/admin/user-management/TeacherAccountResultDialog.vue';
import TeacherApprovalPanel from '../../components/admin/user-management/TeacherApprovalPanel.vue';
import UserStatsCards from '../../components/admin/user-management/UserStatsCards.vue';

import { useUserManagement } from '../../composables/useUserManagement';

import type { TeacherAccountResult, TeacherApplication } from '../../types/teacher-application';

type ConfirmAction = 'approveTeacher' | 'activateStudents' | null;

const {
  teacherApplications,
  pendingStudents,
  stats,
  selectedStudentIds,
  pendingCount,
  approveLoading,
  errorMessage,
  approveTeacherApplication,
} = useUserManagement();

const confirmDialog = reactive({
  open: false,
  action: null as ConfirmAction,
  teacher: null as TeacherApplication | null,

  title: '',
  message: '',
  confirmLabel: '確定',
  confirmColor: 'primary',
});

const teacherAccountDialog = reactive({
  open: false,
  teacherName: '',

  result: null as TeacherAccountResult | null,
});

/* 教師核准 */

function requestApproveTeacher(teacher: TeacherApplication) {
  confirmDialog.action = 'approveTeacher';
  confirmDialog.teacher = teacher;

  confirmDialog.title = '核准教師申請';
  confirmDialog.message = `確定核准 ${teacher.name} 的教師帳號申請？`;

  confirmDialog.confirmLabel = '核准';
  confirmDialog.confirmColor = 'primary';

  confirmDialog.open = true;
}

/* 學生批次開通 */

function requestActivateStudents() {
  const count = selectedStudentIds.value.length;

  if (count === 0) {
    return;
  }

  confirmDialog.action = 'activateStudents';
  confirmDialog.teacher = null;

  confirmDialog.title = '開通學生帳號';
  confirmDialog.message = `確定開通 ${count} 位學生的帳號？`;

  confirmDialog.confirmLabel = '確定開通';
  confirmDialog.confirmColor = 'teal';

  confirmDialog.open = true;
}

/* 確認操作 */

async function handleConfirm() {
  switch (confirmDialog.action) {
    case 'approveTeacher':
      await approveTeacher();
      break;

    case 'activateStudents':
      /*
       * TODO:
       * 等 Backend 提供學生批次開通 API
       */
      confirmDialog.open = false;
      break;
  }
}

/* 執行教師核准 */

async function approveTeacher() {
  const teacher = confirmDialog.teacher;

  if (!teacher) {
    return;
  }

  const result = await approveTeacherApplication(teacher.id);

  if (!result) {
    return;
  }

  confirmDialog.open = false;

  teacherAccountDialog.teacherName = teacher.name;

  teacherAccountDialog.result = result;

  teacherAccountDialog.open = true;
}

/* 清除明文帳密 */

function clearTeacherAccountResult() {
  teacherAccountDialog.open = false;
  teacherAccountDialog.teacherName = '';
  teacherAccountDialog.result = null;
}
</script>
