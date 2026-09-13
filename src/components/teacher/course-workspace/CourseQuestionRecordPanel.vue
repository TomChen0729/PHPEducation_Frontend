<template>
  <section class="course-question-record-panel">
    <!-- =========================
         Header
    ========================== -->
    <div class="course-question-record-panel__header">
      <div>
        <div class="course-question-record-panel__title-row">
          <h5 class="text-weight-bold">作答紀錄</h5>

          <q-badge
            v-if="pendingReviewCount > 0"
            color="orange"
            :label="`${pendingReviewCount} 筆待覆核`"
          />
        </div>

        <p>
          查看學生歷次作答結果，並對一般題型進行整筆覆核，或批改程式實作題。
        </p>
      </div>

      <q-btn
        flat
        round
        color="blue"
        icon="refresh"
        :loading="loading"
        @click="handleRefresh"
      >
        <q-tooltip>重新整理</q-tooltip>
      </q-btn>
    </div>

    <!-- =========================
         Toolbar
    ========================== -->
    <div class="course-question-record-panel__toolbar">
      <q-input
        :model-value="searchKeyword"
        outlined
        dense
        clearable
        debounce="200"
        placeholder="搜尋學生姓名、學號、題目或 Bloom"
        class="course-question-record-panel__search"
        @update:model-value="handleSearchUpdate"
      >
        <template #prepend>
          <q-icon name="search" />
        </template>
      </q-input>

      <q-select
        :model-value="typeFilter"
        :options="typeOptions"
        outlined
        dense
        emit-value
        map-options
        behavior="menu"
        label="題型"
        class="course-question-record-panel__filter"
        @update:model-value="handleTypeFilterChange"
      />

      <q-select
        :model-value="statusFilter"
        :options="statusOptions"
        outlined
        dense
        emit-value
        map-options
        behavior="menu"
        label="教師狀態"
        class="course-question-record-panel__filter"
        @update:model-value="handleStatusFilterChange"
      />

      <div class="course-question-record-panel__count">
        共 {{ filteredRecords.length }} 筆
      </div>
    </div>

    <!-- =========================
         Error
    ========================== -->
    <q-banner
      v-if="errorMessage"
      rounded
      class="bg-red-1 text-negative q-mb-md"
    >
      {{ errorMessage }}
    </q-banner>

    <!-- =========================
         Table
    ========================== -->
    <q-table
      flat
      bordered
      row-key="id"
      :rows="filteredRecords"
      :columns="columns"
      :loading="loading"
      :pagination="pagination"
      class="course-question-record-panel__table"
    >
      <!-- Student -->
      <template #body-cell-student="props">
        <q-td :props="props">
          <div class="course-question-record-panel__student">
            <strong>{{ props.row.student_name || '—' }}</strong>

            <span>{{ props.row.student_no || '—' }}</span>
          </div>
        </q-td>
      </template>

      <!-- Question -->
      <template #body-cell-question="props">
        <q-td :props="props">
          <div class="course-question-record-panel__question">
            <strong>{{ props.row.question_title || `題目 #${props.row.question_id}` }}</strong>

            <span v-if="props.row.question_bloom_id">
              Bloom {{ props.row.question_bloom_id }}
            </span>
          </div>
        </q-td>
      </template>

      <!-- Type -->
      <template #body-cell-type="props">
        <q-td :props="props">
          <q-badge outline color="blue-7">
            {{ questionTypeLabel(props.row.question_type) }}
          </q-badge>
        </q-td>
      </template>

      <!-- System Status -->
      <template #body-cell-system_status="props">
        <q-td :props="props">
          <q-badge
            :color="statusColor(props.row.system_status)"
            :label="systemStatusLabel(props.row.system_status)"
          />
        </q-td>
      </template>

      <!-- Teacher Status -->
      <template #body-cell-teacher_status="props">
        <q-td :props="props">
          <q-badge
            :color="statusColor(props.row.teacher_status)"
            :label="teacherStatusLabel(props.row)"
          />
        </q-td>
      </template>

      <!-- Result -->
      <template #body-cell-result="props">
        <q-td :props="props">
          <div class="course-question-record-panel__result-summary">
            {{ resultSummary(props.row) }}
          </div>
        </q-td>
      </template>

      <!-- Created -->
      <template #body-cell-created_at="props">
        <q-td :props="props">
          {{ formatDateTime(props.row.created_at) }}
        </q-td>
      </template>

      <!-- Actions -->
      <template #body-cell-actions="props">
        <q-td :props="props">
          <q-btn
            flat
            dense
            color="blue"
            icon="visibility"
            label="查看 / 覆核"
            @click="openRecordDialog(props.row)"
          />
        </q-td>
      </template>

      <!-- Empty -->
      <template #no-data>
        <div class="course-question-record-panel__empty">
          <q-icon name="assignment" size="52px" color="grey-5" />

          <div>目前沒有符合條件的作答紀錄</div>
        </div>
      </template>
    </q-table>

    <!-- =========================
         Detail / Review Dialog
    ========================== -->
    <QuestionRecordReviewDialog
      v-model="reviewDialogOpen"
      :record="selectedRecord"
      :question="selectedQuestion"
      :blooms="blooms"
      :question-loading="questionLoading"
      :reviewing="selectedRecord ? reviewingRecordId === selectedRecord.id : false"
      :error-message="detailErrorMessage"
      @submit="handleReviewSubmit"
      @close="handleReviewDialogClose"
    />
  </section>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

import { Notify } from 'quasar';

import type { QTableColumn } from 'quasar';

import QuestionRecordReviewDialog from '../question/QuestionRecordReviewDialog.vue';

import { useTeacherQuestionRecords } from '../../../composables/useTeacherQuestionRecords';

import type {
  TeacherQuestionRecordStatusFilter,
  TeacherQuestionRecordTypeFilter,
} from '../../../composables/useTeacherQuestionRecords';

import type { TeacherQuestionType } from '../../../types/teacher-question';

import type {
  TeacherQuestionRecord,
  TeacherQuestionRecordReviewRequest,
  TeacherQuestionRecordStatus,
  TeacherQuestionRecordSubAnswerSummary,
} from '../../../types/teacher-question-record';

const props = defineProps<{
  courseId: number;
}>();

const {
  blooms,
  selectedQuestion,

  filteredRecords,
  pendingReviewCount,

  searchKeyword,
  typeFilter,
  statusFilter,

  loading,
  questionLoading,
  reviewingRecordId,

  errorMessage,
  detailErrorMessage,

  fetchRecordData,
  refreshRecords,
  fetchQuestionDetail,
  reviewRecord,

  setSearchKeyword,
  setTypeFilter,
  setStatusFilter,

  clearQuestionDetail,
  clearRecords,
  clearDetailErrorMessage,
} = useTeacherQuestionRecords();

/*
 * ============================================================
 * Init
 * ============================================================
 */

watch(
  () => props.courseId,
  async (courseId) => {
    clearRecords();

    await fetchRecordData(courseId);
  },
  {
    immediate: true,
  },
);

/*
 * ============================================================
 * Dialog
 * ============================================================
 */

const reviewDialogOpen = ref(false);

const selectedRecord = ref<TeacherQuestionRecord | null>(null);

async function openRecordDialog(record: TeacherQuestionRecord) {
  clearDetailErrorMessage();

  selectedRecord.value = record;

  reviewDialogOpen.value = true;

  await fetchQuestionDetail(record.question_id);
}

function handleReviewDialogClose() {
  reviewDialogOpen.value = false;

  selectedRecord.value = null;

  clearQuestionDetail();
}

async function handleReviewSubmit(data: TeacherQuestionRecordReviewRequest) {
  if (!selectedRecord.value) {
    return;
  }

  const updatedRecord = await reviewRecord(selectedRecord.value.id, data);

  if (!updatedRecord) {
    return;
  }

  selectedRecord.value = updatedRecord;

  Notify.create({
    type: 'positive',
    icon: 'check_circle',
    message: updatedRecord.question_type === 'coding' ? '實作題批改完成' : '作答覆核已儲存',
    position: 'top',
    timeout: 1800,
  });
}

async function handleRefresh() {
  await refreshRecords(props.courseId);
}

/*
 * ============================================================
 * Filter
 * ============================================================
 */

const typeOptions: {
  label: string;
  value: TeacherQuestionRecordTypeFilter;
}[] = [
  { label: '全部題型', value: 'all' },
  { label: '選擇題', value: 'choice' },
  { label: '是非題', value: 'true_false' },
  { label: '填空題', value: 'fill' },
  { label: '除錯題', value: 'debug' },
  { label: '解讀題', value: 'interpret' },
  { label: '實作題', value: 'coding' },
];

const statusOptions: {
  label: string;
  value: TeacherQuestionRecordStatusFilter;
}[] = [
  { label: '全部狀態', value: 'all' },
  { label: '待覆核', value: 'pending' },
  { label: '教師判定正確', value: 'correct' },
  { label: '教師判定錯誤', value: 'wrong' },
];

function handleSearchUpdate(value: string | number | null) {
  setSearchKeyword(String(value ?? ''));
}

function handleTypeFilterChange(value: TeacherQuestionRecordTypeFilter | null) {
  if (!value) {
    return;
  }

  setTypeFilter(value);
}

function handleStatusFilterChange(value: TeacherQuestionRecordStatusFilter | null) {
  if (!value) {
    return;
  }

  setStatusFilter(value);
}

/*
 * ============================================================
 * Table
 * ============================================================
 */

const pagination = ref({
  page: 1,
  rowsPerPage: 10,
});

const columns: QTableColumn<TeacherQuestionRecord>[] = [
  {
    name: 'student',
    label: '學生',
    field: (row) => row.student_name ?? '',
    align: 'left',
    sortable: true,
  },
  {
    name: 'question',
    label: '題目',
    field: (row) => row.question_title ?? '',
    align: 'left',
    sortable: true,
  },
  {
    name: 'type',
    label: '題型',
    field: 'question_type',
    align: 'center',
    sortable: true,
  },
  {
    name: 'result',
    label: '作答摘要',
    field: (row) => resultSummary(row),
    align: 'left',
  },
  {
    name: 'system_status',
    label: '系統結果',
    field: 'system_status',
    align: 'center',
    sortable: true,
  },
  {
    name: 'teacher_status',
    label: '教師覆核',
    field: 'teacher_status',
    align: 'center',
    sortable: true,
  },
  {
    name: 'created_at',
    label: '作答時間',
    field: 'created_at',
    align: 'left',
    sortable: true,
  },
  {
    name: 'actions',
    label: '操作',
    field: 'id',
    align: 'center',
  },
];

/*
 * ============================================================
 * Display Helpers
 * ============================================================
 */

function questionTypeLabel(type: TeacherQuestionType) {
  const labels: Record<TeacherQuestionType, string> = {
    choice: '選擇題',
    true_false: '是非題',
    fill: '填空題',
    debug: '除錯題',
    interpret: '解讀題',
    coding: '實作題',
  };

  return labels[type];
}

function systemStatusLabel(status: TeacherQuestionRecordStatus) {
  const labels: Record<TeacherQuestionRecordStatus, string> = {
    pending: '待判定',
    correct: '正確',
    wrong: '錯誤',
  };

  return labels[status];
}

function teacherStatusLabel(record: TeacherQuestionRecord) {
  if (record.teacher_status === 'pending') {
    return record.question_type === 'coding' ? '待批改' : '待覆核';
  }

  return record.teacher_status === 'correct' ? '教師判定正確' : '教師判定錯誤';
}

function statusColor(status: TeacherQuestionRecordStatus) {
  if (status === 'correct') {
    return 'positive';
  }

  if (status === 'wrong') {
    return 'negative';
  }

  return 'orange';
}

function resultSummary(record: TeacherQuestionRecord) {
  if (record.question_type === 'coding') {
    return '程式碼作答';
  }

  if (record.question_type === 'choice' || record.question_type === 'true_false') {
    return typeof record.result === 'string' || typeof record.result === 'number'
      ? `選項 #${record.result}`
      : '—';
  }

  if (isSubAnswerSummary(record.result)) {
    return `${record.result.correct} / ${record.result.total} 答對`;
  }

  if (record.subs.length > 0) {
    const correct = record.subs.filter((sub) => sub.is_right).length;

    return `${correct} / ${record.subs.length} 答對`;
  }

  return '—';
}

function isSubAnswerSummary(value: unknown): value is TeacherQuestionRecordSubAnswerSummary {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }

  const candidate = value as Partial<TeacherQuestionRecordSubAnswerSummary>;

  return typeof candidate.correct === 'number' && typeof candidate.total === 'number';
}

function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return new Intl.DateTimeFormat('zh-TW', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}
</script>
