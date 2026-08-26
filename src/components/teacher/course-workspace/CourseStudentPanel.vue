<template>
  <section class="course-student-panel">
    <!-- =========================
         Header
    ========================== -->
    <div class="course-student-panel__header">
      <div>
        <div class="course-student-panel__title">班級學生</div>

        <div class="course-student-panel__description">
          <template v-if="className"> 管理 {{ className }} 的學生名單與待審核申請 </template>

          <template v-else> 管理此課程的學生名單與待審核申請 </template>
        </div>
      </div>

      <div class="course-student-panel__header-actions">
        <q-btn
          outline
          color="blue"
          icon="upload_file"
          label="匯入"
          :disable="importing || adding"
          @click="openImportDialog"
        />

        <q-btn
          unelevated
          color="blue"
          icon="person_add"
          label="新增學生"
          :disable="importing || adding"
          @click="openAddDialog"
        />
      </div>
    </div>

    <!-- =========================
         Toolbar
    ========================== -->
    <div class="course-student-panel__toolbar">
      <div class="course-student-panel__toolbar-left">
        <!-- Search -->
        <q-input
          :model-value="searchKeyword"
          outlined
          dense
          clearable
          debounce="200"
          placeholder="搜尋學號、姓名或 Email"
          class="course-student-panel__search"
          @update:model-value="handleSearchUpdate"
        >
          <template #prepend>
            <q-icon name="search" />
          </template>
        </q-input>

        <!-- Status Filter -->
        <q-select
          :model-value="status"
          :options="statusOptions"
          outlined
          dense
          emit-value
          map-options
          label="名單篩選"
          class="course-student-panel__filter"
          @update:model-value="handleStatusChange"
        >
          <template #prepend>
            <q-icon name="filter_list" />
          </template>
        </q-select>
      </div>

      <div class="course-student-panel__count">
        {{ status === 'approved' ? '已開通' : '待審核' }}
        {{ filteredStudents.length }} 位
      </div>
    </div>

    <!-- =========================
         Info
    ========================== -->
    <q-banner v-if="status === 'pending'" rounded class="course-student-panel__pending-banner">
      <template #avatar>
        <q-icon name="schedule" color="orange-8" />
      </template>

      此名單尚待管理員審核。審核通過後，學生會自動移至「已開通」名單。
    </q-banner>

    <!-- =========================
         Error
    ========================== -->
    <q-banner v-if="errorMessage" rounded class="bg-red-1 text-negative q-mb-md">
      {{ errorMessage }}
    </q-banner>

    <!-- =========================
         Student Table
    ========================== -->
    <q-table
      flat
      bordered
      row-key="id"
      :rows="filteredStudents"
      :columns="columns"
      :loading="loading"
      :pagination="pagination"
      class="course-student-panel__table"
    >
      <!-- Email -->
      <template #body-cell-email="props">
        <q-td :props="props">
          <div class="course-student-panel__email">
            {{ props.row.email }}
          </div>
        </q-td>
      </template>

      <!-- Actions -->
      <template #body-cell-actions="props">
        <q-td :props="props">
          <div class="course-student-panel__row-actions">
            <q-btn
              flat
              round
              dense
              color="negative"
              icon="person_remove"
              :loading="removingStudentId === props.row.id"
              :disable="removingStudentId !== null"
              @click="requestRemoveStudent(props.row)"
            >
              <q-tooltip>
                {{ props.row.status === 'approved' ? '從課程移除' : '取消申請' }}
              </q-tooltip>
            </q-btn>
          </div>
        </q-td>
      </template>

      <!-- Empty -->
      <template #no-data>
        <div class="course-student-panel__empty">
          <q-icon
            :name="status === 'approved' ? 'group_off' : 'pending_actions'"
            size="48px"
            color="grey-5"
          />

          <div>
            {{ status === 'approved' ? '目前沒有已開通學生' : '目前沒有待審核學生' }}
          </div>
        </div>
      </template>
    </q-table>

    <!-- ========================================================
         Import Dialog
    ========================================================= -->
    <q-dialog v-model="importDialogOpen" persistent>
      <q-card class="course-student-panel__dialog">
        <q-card-section class="course-student-panel__dialog-header">
          <div>
            <div class="text-h6">匯入學生</div>

            <div class="text-caption text-grey-7">使用 Excel 一次匯入多筆學生資料</div>
          </div>

          <q-btn
            flat
            round
            dense
            icon="close"
            :disable="importing || downloadingTemplate"
            @click="closeImportDialog"
          />
        </q-card-section>

        <q-separator />

        <q-card-section class="course-student-panel__dialog-content">
          <!-- Template -->
          <div class="course-student-panel__import-section">
            <div class="course-student-panel__field-label">1. 下載學生匯入範本</div>

            <div class="course-student-panel__field-description">
              Excel 只需要填寫學生的學號與姓名。
            </div>

            <q-btn
              outline
              color="blue"
              icon="download"
              label="下載範例 Excel"
              :loading="downloadingTemplate"
              :disable="importing"
              @click="handleDownloadTemplate"
            />
          </div>

          <q-separator />

          <!-- Upload -->
          <div class="course-student-panel__import-section">
            <div class="course-student-panel__field-label">2. 上傳學生名單</div>

            <q-file
              v-model="importFile"
              outlined
              clearable
              accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              label="選擇 Excel 檔案"
              :disable="importing"
            >
              <template #prepend>
                <q-icon name="description" />
              </template>
            </q-file>

            <div class="course-student-panel__hint">
              匯入後學生會先進入「待審核」名單，需由管理員開通。
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn flat label="取消" :disable="importing" @click="closeImportDialog" />

          <q-btn
            unelevated
            color="blue"
            label="匯入"
            icon="upload"
            :loading="importing"
            :disable="!importFile"
            @click="submitImport"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ========================================================
         Add Students Dialog
    ========================================================= -->
    <q-dialog v-model="addDialogOpen" persistent>
      <q-card class="course-student-panel__dialog course-student-panel__dialog--large">
        <q-card-section class="course-student-panel__dialog-header">
          <div>
            <div class="text-h6">新增學生</div>

            <div class="text-caption text-grey-7">可一次輸入多筆學生資料</div>
          </div>

          <q-btn flat round dense icon="close" :disable="adding" @click="closeAddDialog" />
        </q-card-section>

        <q-separator />

        <q-card-section class="course-student-panel__dialog-content">
          <q-banner rounded class="bg-blue-1 text-blue-9 q-mb-md">
            學號直接輸入數字即可，不需要輸入前綴 s。新增後需等待管理員審核。
          </q-banner>

          <!-- Header -->
          <div class="course-student-panel__student-row-header">
            <div>學號</div>

            <div>姓名</div>

            <div></div>
          </div>

          <!-- Rows -->
          <div
            v-for="row in addStudentRows"
            :key="row.key"
            class="course-student-panel__student-row"
          >
            <q-input
              :model-value="row.studentNo"
              outlined
              dense
              label="學號"
              maxlength="20"
              :disable="adding"
              @update:model-value="(value) => updateInputStudentNo(row, value)"
            />

            <q-input
              v-model="row.name"
              outlined
              dense
              label="姓名"
              maxlength="50"
              :disable="adding"
            />

            <q-btn
              flat
              round
              dense
              color="negative"
              icon="delete"
              :disable="addStudentRows.length === 1 || adding"
              @click="removeStudentInputRow(row.key)"
            />
          </div>

          <!-- Add Row -->
          <q-btn
            flat
            color="blue"
            icon="add"
            label="新增一筆學生"
            class="course-student-panel__add-row"
            :disable="addStudentRows.length >= 100 || adding"
            @click="addStudentInputRow"
          />

          <div class="course-student-panel__row-count">
            已輸入 {{ addStudentRows.length }} / 100 位
          </div>

          <div v-if="addErrorMessage" class="course-student-panel__form-error">
            {{ addErrorMessage }}
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn flat label="取消" :disable="adding" @click="closeAddDialog" />

          <q-btn
            unelevated
            color="blue"
            icon="person_add"
            label="確認新增"
            :loading="adding"
            @click="submitAddStudents"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </section>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

import { Dialog, Notify } from 'quasar';

import type { QTableColumn } from 'quasar';

import { useTeacherCourseStudents } from '../../../composables/useTeacherCourseStudents';

import type { CourseStudent, CourseStudentStatus } from '../../../types/course-student';

/*
 * =========================
 * Props
 * =========================
 */
const props = withDefaults(
  defineProps<{
    courseId: number;

    className?: string;
  }>(),
  {
    className: '',
  },
);

/*
 * =========================
 * Composable
 * =========================
 */
const {
  filteredStudents,

  status,

  searchKeyword,

  loading,

  adding,

  importing,

  downloadingTemplate,

  removingStudentId,

  errorMessage,

  fetchStudents,

  changeStatus,

  addStudents,

  removeStudent,

  downloadTemplate,

  importStudents,

  setSearchKeyword,

  clearStudents,

  clearErrorMessage,
} = useTeacherCourseStudents();

/*
 * =========================
 * Init
 * =========================
 */
watch(
  () => props.courseId,

  async (courseId) => {
    clearStudents();

    await fetchStudents(courseId);
  },

  {
    immediate: true,
  },
);

/*
 * =========================
 * Status Filter
 * =========================
 */
const statusOptions = [
  {
    label: '已開通',

    value: 'approved',
  },

  {
    label: '待審核',

    value: 'pending',
  },
];

async function handleStatusChange(value: CourseStudentStatus | null) {
  if (!value) {
    return;
  }

  await changeStatus(props.courseId, value);
}

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
 * Table
 * =========================
 */
const pagination = ref({
  page: 1,

  rowsPerPage: 10,
});

const columns: QTableColumn<CourseStudent>[] = [
  {
    name: 'student_no',

    label: '學號',

    field: 'student_no',

    align: 'left',

    sortable: true,
  },

  {
    name: 'name',

    label: '姓名',

    field: 'name',

    align: 'left',

    sortable: true,
  },

  {
    name: 'email',

    label: 'Email',

    field: 'email',

    align: 'left',
  },

  {
    name: 'actions',

    label: '操作',

    field: (row) => row.id,

    align: 'right',
  },
];

/*
 * =========================
 * Student Number
 * =========================
 */
function normalizeStudentNo(value: string | number | null) {
  return String(value ?? '')
    .replace(/^s/i, '')
    .replace(/\D/g, '');
}

/*
 * ============================================================
 * Import
 * ============================================================
 */
const importDialogOpen = ref(false);

const importFile = ref<File | null>(null);

function openImportDialog() {
  clearErrorMessage();

  importFile.value = null;

  importDialogOpen.value = true;
}

function closeImportDialog() {
  if (importing.value) {
    return;
  }

  importDialogOpen.value = false;

  importFile.value = null;

  clearErrorMessage();
}

async function handleDownloadTemplate() {
  const success = await downloadTemplate();

  if (!success) {
    Notify.create({
      type: 'negative',

      icon: 'error_outline',

      message: errorMessage.value || '學生匯入範本下載失敗',

      position: 'top',

      timeout: 2500,
    });

    clearErrorMessage();

    return;
  }

  Notify.create({
    type: 'positive',

    icon: 'check_circle',

    message: '學生匯入範本下載完成',

    position: 'top',

    timeout: 1500,
  });
}

async function submitImport() {
  if (!importFile.value) {
    return;
  }

  const success = await importStudents(props.courseId, importFile.value);

  if (!success) {
    Notify.create({
      type: 'negative',

      icon: 'error_outline',

      message: errorMessage.value || '學生名冊匯入失敗',

      position: 'top',

      timeout: 2500,
    });

    clearErrorMessage();

    return;
  }

  closeImportDialog();

  Notify.create({
    type: 'positive',

    icon: 'check_circle',

    message: '學生名冊匯入成功，已加入待審核名單',

    position: 'top',

    timeout: 1800,
  });
}

/*
 * ============================================================
 * Add Students
 * ============================================================
 */
interface StudentInputRow {
  key: number;

  studentNo: string;

  name: string;
}

const addDialogOpen = ref(false);

const addErrorMessage = ref('');

let nextInputRowKey = 1;

const addStudentRows = ref<StudentInputRow[]>([createInputRow()]);

function createInputRow(): StudentInputRow {
  return {
    key: nextInputRowKey++,

    studentNo: '',

    name: '',
  };
}

function openAddDialog() {
  clearErrorMessage();

  addStudentRows.value = [createInputRow()];

  addErrorMessage.value = '';

  addDialogOpen.value = true;
}

function closeAddDialog() {
  if (adding.value) {
    return;
  }

  addDialogOpen.value = false;

  addErrorMessage.value = '';

  clearErrorMessage();
}

function addStudentInputRow() {
  if (addStudentRows.value.length >= 100) {
    return;
  }

  addStudentRows.value.push(createInputRow());
}

function removeStudentInputRow(key: number) {
  if (addStudentRows.value.length === 1) {
    return;
  }

  addStudentRows.value = addStudentRows.value.filter((row) => row.key !== key);
}

function updateInputStudentNo(
  row: StudentInputRow,

  value: string | number | null,
) {
  row.studentNo = normalizeStudentNo(value);
}

function validateAddStudents(): string | null {
  /*
   * 至少一筆。
   */
  if (addStudentRows.value.length === 0) {
    return '請至少輸入一位學生。';
  }

  /*
   * Backend 上限 100 人。
   */
  if (addStudentRows.value.length > 100) {
    return '一次最多新增 100 位學生。';
  }

  /*
   * 必填。
   */
  const incompleteRow = addStudentRows.value.find(
    (row) => !row.studentNo.trim() || !row.name.trim(),
  );

  if (incompleteRow) {
    return '請完整填寫每一位學生的學號與姓名。';
  }

  /*
   * 同一批不能重複學號。
   */
  const studentNos = addStudentRows.value.map((row) => row.studentNo);

  const uniqueStudentNos = new Set(studentNos);

  if (uniqueStudentNos.size !== studentNos.length) {
    return '同一批新增資料中有重複學號。';
  }

  return null;
}

async function submitAddStudents() {
  const validationError = validateAddStudents();

  if (validationError) {
    addErrorMessage.value = validationError;

    return;
  }

  addErrorMessage.value = '';

  const success = await addStudents(
    props.courseId,

    addStudentRows.value.map((row) => ({
      student_no: row.studentNo,

      name: row.name.trim(),
    })),
  );

  if (!success) {
    Notify.create({
      type: 'negative',

      icon: 'error_outline',

      message: errorMessage.value || '學生新增失敗',

      position: 'top',

      timeout: 2500,
    });

    clearErrorMessage();

    return;
  }

  closeAddDialog();

  Notify.create({
    type: 'positive',

    icon: 'check_circle',

    message: '學生新增成功，已加入待審核名單',

    position: 'top',

    timeout: 1800,
  });
}

/*
 * ============================================================
 * Remove Student
 * ============================================================
 */
function requestRemoveStudent(student: CourseStudent) {
  const isApproved = student.status === 'approved';

  Dialog.create({
    title: isApproved ? '從課程移除學生' : '取消待審核學生',

    message: isApproved
      ? `確定要將「${student.name}」從此課程移除嗎？學生帳號會保留，其他課程不受影響。`
      : `確定要移除「${student.name}」的待審核申請嗎？`,

    cancel: {
      label: '取消',

      flat: true,
    },

    ok: {
      label: isApproved ? '確認移除' : '取消申請',

      color: 'negative',
    },

    persistent: true,
  }).onOk(() => {
    void performRemoveStudent(student);
  });
}

async function performRemoveStudent(student: CourseStudent) {
  const success = await removeStudent(props.courseId, student.id);

  if (!success) {
    Notify.create({
      type: 'negative',

      icon: 'error_outline',

      message: errorMessage.value || '學生移除失敗',

      position: 'top',

      timeout: 2500,
    });

    clearErrorMessage();

    return;
  }

  Notify.create({
    type: 'positive',

    icon: 'check_circle',

    message:
      student.status === 'approved'
        ? `「${student.name}」已從課程移除`
        : `「${student.name}」的待審核申請已取消`,

    position: 'top',

    timeout: 1800,
  });
}
</script>

<style scoped lang="scss" src="../../../css/components/teacher/_course-student-panel.scss"></style>
