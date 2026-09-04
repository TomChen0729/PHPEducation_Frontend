<template>
  <section class="course-question-panel">
    <!-- =========================
         Header
    ========================== -->
    <div class="course-question-panel__header">
      <div>
        <h5 class="text-weight-bold">題庫管理</h5>
      </div>

      <q-btn
        unelevated
        color="blue"
        icon="add"
        label="新增題目"
        :disable="loading || saving"
        @click="openCreateDialog"
      />
    </div>

    <!-- =========================
         Toolbar
    ========================== -->
    <div class="course-question-panel__toolbar">
      <q-input
        :model-value="searchKeyword"
        outlined
        dense
        clearable
        debounce="200"
        placeholder="搜尋題目、內容、Bloom 或知識卡"
        class="course-question-panel__search"
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
        class="course-question-panel__type-filter"
        @update:model-value="handleTypeFilterChange"
      />

      <div class="course-question-panel__count">
        共
        {{ filteredQuestions.length }}
        題
      </div>
    </div>

    <!-- =========================
         Error
    ========================== -->
    <q-banner v-if="errorMessage && !formDialogOpen" rounded class="bg-red-1 text-negative q-mb-md">
      {{ errorMessage }}
    </q-banner>

    <!-- =========================
         Table
    ========================== -->
    <q-table
      flat
      bordered
      row-key="id"
      :rows="filteredQuestions"
      :columns="columns"
      :loading="loading"
      :pagination="pagination"
      class="course-question-panel__table"
    >
      <!-- Type -->
      <template #body-cell-type="props">
        <q-td :props="props">
          <q-badge outline color="blue-7">
            {{ getQuestionTypeLabel(props.row.type) }}
          </q-badge>
        </q-td>
      </template>

      <!-- Bloom -->
      <template #body-cell-bloom="props">
        <q-td :props="props">
          <q-badge v-if="props.row.bloom_id" color="blue-1" text-color="blue-9">
            {{ props.row.bloom_id }}
          </q-badge>

          <span v-else class="text-grey-6"> — </span>
        </q-td>
      </template>

      <!-- Knowledge Cards -->
      <template #body-cell-knowledge_cards="props">
        <q-td :props="props">
          <div class="course-question-panel__knowledge-cards">
            <q-chip
              v-for="card in props.row.knowledge_cards"
              :key="card.id"
              dense
              outline
              color="blue-7"
            >
              {{ card.title }}
            </q-chip>

            <span v-if="props.row.knowledge_cards.length === 0" class="text-grey-6"> — </span>
          </div>
        </q-td>
      </template>

      <!-- Updated -->
      <template #body-cell-updated_at="props">
        <q-td :props="props">
          {{ formatDateTime(props.row.updated_at) }}
        </q-td>
      </template>

      <!-- Actions -->
      <template #body-cell-actions="props">
        <q-td :props="props">
          <div class="course-question-panel__actions">
            <!-- Edit -->
            <q-btn
              flat
              round
              dense
              color="blue"
              icon="edit"
              :disable="deletingQuestionId !== null"
              @click="openEditDialog(props.row)"
            >
              <q-tooltip> 編輯題目 </q-tooltip>
            </q-btn>

            <!-- Delete -->
            <q-btn
              flat
              round
              dense
              color="negative"
              icon="delete"
              :loading="deletingQuestionId === props.row.id"
              :disable="deletingQuestionId !== null"
              @click="requestDeleteQuestion(props.row)"
            >
              <q-tooltip> 刪除題目 </q-tooltip>
            </q-btn>
          </div>
        </q-td>
      </template>

      <!-- Empty -->
      <template #no-data>
        <div class="course-question-panel__empty">
          <q-icon name="quiz" size="52px" color="grey-5" />

          <div>目前沒有題目</div>

          <q-btn flat color="blue" icon="add" label="建立第一題" @click="openCreateDialog" />
        </div>
      </template>
    </q-table>

    <!-- ========================================================
         Question Form
    ========================================================= -->
    <QuestionFormDialog
      v-model="formDialogOpen"
      :mode="formMode"
      :question="editingQuestion"
      :blooms="blooms"
      :knowledge-cards="knowledgeCards"
      :saving="saving"
      :error-message="formErrorMessage"
      @submit="handleSubmitQuestion"
      @clear-error="clearFormError"
    />
  </section>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

import { Dialog, Notify } from 'quasar';

import type { QTableColumn } from 'quasar';

import QuestionFormDialog from '../question/QuestionFormDialog.vue';

import { useTeacherQuestions } from '../../../composables/useTeacherQuestions';

import type {
  TeacherQuestion,
  TeacherQuestionRequest,
  TeacherQuestionType,
} from '../../../types/teacher-question';

import type { TeacherQuestionTypeFilter } from '../../../composables/useTeacherQuestions';

/*
 * =========================
 * Props
 * =========================
 */

const props = defineProps<{
  courseId: number;
}>();

/*
 * =========================
 * Composable
 * =========================
 */

const {
  blooms,

  knowledgeCards,

  filteredQuestions,

  searchKeyword,

  typeFilter,

  loading,

  saving,

  deletingQuestionId,

  errorMessage,

  fetchQuestionData,

  createQuestion,

  updateQuestion,

  deleteQuestion,

  setSearchKeyword,

  setTypeFilter,

  clearErrorMessage,

  clearQuestions,
} = useTeacherQuestions();

/*
 * =========================
 * Init
 * =========================
 */

watch(
  () => props.courseId,

  async (courseId) => {
    clearQuestions();

    await fetchQuestionData(courseId);
  },

  {
    immediate: true,
  },
);

/*
 * ============================================================
 * Question Form
 * ============================================================
 */

const formDialogOpen = ref(false);

const formMode = ref<'create' | 'edit'>('create');

const editingQuestion = ref<TeacherQuestion | null>(null);

const formErrorMessage = ref('');

/*
 * =========================
 * Create
 * =========================
 */

function openCreateDialog() {
  clearErrorMessage();

  formErrorMessage.value = '';

  formMode.value = 'create';

  editingQuestion.value = null;

  formDialogOpen.value = true;
}

/*
 * =========================
 * Edit
 * =========================
 */

function openEditDialog(question: TeacherQuestion) {
  clearErrorMessage();

  formErrorMessage.value = '';

  formMode.value = 'edit';

  editingQuestion.value = question;

  formDialogOpen.value = true;
}

/*
 * =========================
 * Clear Form Error
 * =========================
 */

function clearFormError() {
  formErrorMessage.value = '';

  clearErrorMessage();
}

/*
 * =========================
 * Submit
 * =========================
 */

async function handleSubmitQuestion(data: TeacherQuestionRequest) {
  formErrorMessage.value = '';

  let success = false;

  /*
   * Create
   */
  if (formMode.value === 'create') {
    success = await createQuestion(props.courseId, data);
  }

  /*
   * Edit
   */
  if (formMode.value === 'edit' && editingQuestion.value) {
    success = await updateQuestion(
      props.courseId,

      editingQuestion.value.id,

      data,
    );
  }

  /*
   * Failed
   *
   * Dialog 保持開啟。
   */
  if (!success) {
    formErrorMessage.value =
      errorMessage.value || (formMode.value === 'create' ? '題目新增失敗' : '題目修改失敗');

    clearErrorMessage();

    Notify.create({
      type: 'negative',

      icon: 'error_outline',

      message: formErrorMessage.value,

      position: 'top',

      timeout: 2500,
    });

    return;
  }

  /*
   * Success
   */
  const successMessage = formMode.value === 'create' ? '題目新增成功' : '題目修改成功';

  formDialogOpen.value = false;

  editingQuestion.value = null;

  Notify.create({
    type: 'positive',

    icon: 'check_circle',

    message: successMessage,

    position: 'top',

    timeout: 1500,
  });
}

/*
 * ============================================================
 * Delete
 * ============================================================
 */

function requestDeleteQuestion(question: TeacherQuestion) {
  Dialog.create({
    title: '刪除題目',

    message: `確定要刪除「${question.title}」嗎？此操作無法復原。`,

    cancel: {
      label: '取消',

      flat: true,
    },

    ok: {
      label: '確認刪除',

      color: 'negative',
    },

    persistent: true,
  }).onOk(() => {
    void performDeleteQuestion(question);
  });
}

async function performDeleteQuestion(question: TeacherQuestion) {
  const success = await deleteQuestion(props.courseId, question.id);

  if (!success) {
    Notify.create({
      type: 'negative',

      icon: 'error_outline',

      message: errorMessage.value || '題目刪除失敗',

      position: 'top',

      timeout: 2500,
    });

    clearErrorMessage();

    return;
  }

  Notify.create({
    type: 'positive',

    icon: 'check_circle',

    message: `「${question.title}」已刪除`,

    position: 'top',

    timeout: 1500,
  });
}

/*
 * ============================================================
 * Filter Options
 * ============================================================
 */

const typeOptions = [
  {
    label: '全部題型',

    value: 'all',
  },

  {
    label: '選擇題',

    value: 'choice',
  },

  {
    label: '是非題',

    value: 'true_false',
  },

  {
    label: '填空題',

    value: 'fill',
  },

  {
    label: '除錯題',

    value: 'debug',
  },

  {
    label: '解讀題',

    value: 'interpret',
  },

  {
    label: '實作題',

    value: 'coding',
  },
];

/*
 * =========================
 * Search
 * =========================
 */

function handleSearchUpdate(value: string | number | null) {
  setSearchKeyword(String(value ?? ''));
}

/*
 * =========================
 * Type Filter
 * =========================
 */

function handleTypeFilterChange(value: TeacherQuestionTypeFilter | null) {
  if (!value) {
    return;
  }

  setTypeFilter(value);
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

const columns: QTableColumn<TeacherQuestion>[] = [
  {
    name: 'title',

    label: '題目名稱',

    field: 'title',

    align: 'left',

    sortable: true,
  },

  {
    name: 'type',

    label: '題型',

    field: 'type',

    align: 'center',

    sortable: true,
  },

  {
    name: 'bloom',

    label: 'Bloom',

    field: 'bloom_id',

    align: 'center',
  },

  {
    name: 'knowledge_cards',

    label: '關聯知識卡',

    field: (row) => row.knowledge_cards.length,

    align: 'left',

    style: 'width: 50%; max-width: 50%;',

    headerStyle: 'width: 50%; max-width: 50%;',
  },

  {
    name: 'updated_at',

    label: '最後更新',

    field: 'updated_at',

    align: 'left',

    sortable: true,
  },

  {
    name: 'actions',

    label: '操作',

    field: (row) => row.id,

    align: 'center',
  },
];

/*
 * ============================================================
 * Type Label
 * ============================================================
 */

function getQuestionTypeLabel(type: TeacherQuestionType): string {
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

/*
 * ============================================================
 * Date
 * ============================================================
 */

function formatDateTime(value: string): string {
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
