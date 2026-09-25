<template>
  <section class="course-student-panel">
    <!-- =========================
         Header
    ========================== -->
    <div class="course-student-panel__header">
      <div>
        <h5 class="text-weight-bold course-student-panel__title">班級學生</h5>
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

      此名單尚待管理員審核。管理員開通來源課程後，學生會自動移至「已開通」名單。
      若本次有新建立的學生帳號，系統會將帳號名單寄到教師信箱；若未收到，請檢查垃圾郵件。
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
              color="blue"
              icon="edit"
              :disable="removingStudentId !== null || updatingStudentId !== null"
              @click="openEditDialog(props.row)"
            >
              <q-tooltip>修改學生資料</q-tooltip>
            </q-btn>

            <q-btn
              flat
              round
              dense
              color="negative"
              icon="person_remove"
              :loading="removingStudentId === props.row.id"
              :disable="removingStudentId !== null || updatingStudentId !== null"
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
              匯入後學生會先進入「待審核」名單，需由管理員開通來源課程。
            </div>

            <q-banner rounded dense class="bg-amber-1 text-brown-9">
              <template #avatar>
                <q-icon name="mark_email_unread" color="amber-9" />
              </template>

              管理員開通課程後，若本次有新建立的學生帳號，系統會將學生帳號名單寄到教師信箱。
              若收件匣中沒有看到，請檢查垃圾郵件。
            </q-banner>
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
      <q-card class="course-student-panel__dialog course-student-panel__dialog--student-form">
        <q-card-section class="course-student-panel__dialog-header">
          <div>
            <div class="text-h6">新增學生</div>

            <div class="text-caption text-grey-7">可一次輸入多筆學生學號、姓名與信箱</div>
          </div>

          <q-btn flat round dense icon="close" :disable="adding" @click="closeAddDialog" />
        </q-card-section>

        <q-separator />

        <q-card-section class="course-student-panel__dialog-content">
          <q-banner rounded class="bg-blue-1 text-blue-9 q-mb-md">
            請輸入學生學號與姓名；信箱選填。若未填信箱，尚未開通的學生之後會使用
            <strong>s{學號}@nutc.edu.tw</strong> 建立帳號。
            若輸入的學號或姓名已有學生帳號，系統會自動帶入另一欄。
          </q-banner>

          <q-banner rounded dense class="bg-amber-1 text-brown-9 q-mb-md">
            <template #avatar>
              <q-icon name="mark_email_unread" color="amber-9" />
            </template>

            已有帳號的學生會直接加入課程並沿用既有帳號資料； 尚無帳號的學生才會進入「待審核」名單。
          </q-banner>

          <!-- Header -->
          <div class="course-student-panel__student-row-header">
            <div>學號</div>
            <div>姓名</div>
            <div>信箱（選填）</div>
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
              :loading="row.lookupLoading"
              @update:model-value="(value) => updateInputStudentNo(row, value)"
              @blur="lookupRowByStudentNo(row)"
            >
              <template #append>
                <q-icon v-if="row.hasAccount" name="verified" color="positive">
                  <q-tooltip>此學生已有帳號</q-tooltip>
                </q-icon>
              </template>
            </q-input>

            <div class="course-student-panel__student-field">
              <q-input
                :model-value="row.name"
                outlined
                dense
                label="姓名"
                maxlength="100"
                :disable="adding"
                :loading="row.lookupLoading"
                @update:model-value="(value) => updateInputStudentName(row, value)"
                @blur="lookupRowByName(row)"
              />

              <q-select
                v-if="row.nameMatches.length > 1"
                outlined
                dense
                emit-value
                map-options
                label="找到多位同名學生，請選擇"
                :model-value="null"
                :options="studentMatchOptions(row)"
                :disable="adding"
                class="course-student-panel__match-select"
                @update:model-value="(value) => selectNameMatch(row, value)"
              />
            </div>

            <q-input
              :model-value="row.email"
              outlined
              dense
              label="信箱（選填）"
              type="email"
              maxlength="255"
              :disable="adding || row.hasAccount"
              @update:model-value="(value) => updateInputStudentEmail(row, value)"
            >
              <template #hint>
                <span v-if="row.hasAccount"> 已有帳號，已自動帶入既有信箱 </span>

                <span v-else> 未填則使用 {{ defaultStudentEmail(row.studentNo) }} </span>
              </template>
            </q-input>

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

    <!-- ========================================================
         Edit Student Dialog
    ========================================================= -->
    <q-dialog v-model="editDialogOpen" persistent>
      <q-card class="course-student-panel__dialog course-student-panel__dialog--edit">
        <q-card-section class="course-student-panel__dialog-header">
          <div>
            <div class="text-h6">修改學生資料</div>

            <div class="text-caption text-grey-7">可修改學號、姓名與信箱</div>
          </div>

          <q-btn
            flat
            round
            dense
            icon="close"
            :disable="updatingStudentId !== null"
            @click="closeEditDialog"
          />
        </q-card-section>

        <q-separator />

        <q-card-section class="course-student-panel__dialog-content">
          <q-banner
            v-if="editingStudent?.has_account"
            rounded
            class="bg-blue-1 text-blue-9 q-mb-md"
          >
            此學生已有正式帳號。姓名會以既有帳號資料為準； 學號與信箱可依 Backend 規則更新。
          </q-banner>

          <div class="course-student-panel__edit-form">
            <q-input
              :model-value="editStudentNo"
              outlined
              label="學號 *"
              maxlength="20"
              :disable="updatingStudentId !== null"
              @update:model-value="updateEditStudentNo"
            />

            <q-input
              v-model="editName"
              outlined
              label="姓名 *"
              maxlength="100"
              :disable="updatingStudentId !== null || Boolean(editingStudent?.has_account)"
              :hint="
                editingStudent?.has_account ? '已有帳號的學生姓名以正式帳號資料為準' : undefined
              "
            />

            <q-input
              :model-value="editEmail"
              outlined
              type="email"
              label="信箱（選填）"
              maxlength="255"
              :disable="updatingStudentId !== null"
              @update:model-value="updateEditEmail"
            >
              <template #hint>
                <span>
                  若使用預設校園信箱，修改學號時會同步更新為
                  {{ defaultStudentEmail(editStudentNo) }}
                </span>
              </template>
            </q-input>
          </div>

          <div v-if="editErrorMessage" class="course-student-panel__form-error">
            {{ editErrorMessage }}
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn flat label="取消" :disable="updatingStudentId !== null" @click="closeEditDialog" />

          <q-btn
            unelevated
            color="blue"
            icon="save"
            label="儲存修改"
            :loading="updatingStudentId !== null"
            @click="submitEditStudent"
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

import type {
  CourseStudent,
  CourseStudentStatus,
  StudentLookupMatch,
} from '../../../types/course-student';

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

  updatingStudentId,

  importing,

  downloadingTemplate,

  removingStudentId,

  errorMessage,

  fetchStudents,

  changeStatus,

  lookupStudent,

  addStudents,

  updateStudent,

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

  email: string;

  hasAccount: boolean;

  lookupLoading: boolean;

  nameMatches: StudentLookupMatch[];
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
    email: '',
    hasAccount: false,
    lookupLoading: false,
    nameMatches: [],
  };
}

function defaultStudentEmail(studentNo: string) {
  const normalized = normalizeStudentNo(studentNo);

  return normalized ? `s${normalized}@nutc.edu.tw` : 's{學號}@nutc.edu.tw';
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

function updateInputStudentNo(row: StudentInputRow, value: string | number | null) {
  row.studentNo = normalizeStudentNo(value);

  /*
   * 修改學號後先清除「已有帳號」判定。
   * 失焦時再查 Backend。
   */
  row.hasAccount = false;
  row.nameMatches = [];
}

function updateInputStudentName(row: StudentInputRow, value: string | number | null) {
  row.name = String(value ?? '');
  row.nameMatches = [];
}

function updateInputStudentEmail(row: StudentInputRow, value: string | number | null) {
  row.email = String(value ?? '').trim();
}

async function lookupRowByStudentNo(row: StudentInputRow) {
  const studentNo = row.studentNo.trim();

  if (!studentNo || row.lookupLoading || adding.value) {
    return;
  }

  row.lookupLoading = true;

  const result = await lookupStudent({
    student_no: studentNo,
  });

  row.lookupLoading = false;

  if (!result) {
    return;
  }

  row.hasAccount = result.has_account;
  row.nameMatches = [];

  if (result.has_account && result.name) {
    row.name = result.name;

    /*
     * Backend 更新後會回傳 email。
     * 前端先支援此欄位，Backend 尚未更新時仍可正常運作。
     */
    row.email = result.email ?? result.matches[0]?.email ?? '';
  }
}

async function lookupRowByName(row: StudentInputRow) {
  const name = row.name.trim();

  if (!name || row.lookupLoading || adding.value) {
    return;
  }

  /*
   * 已經由學號查到帳號時，不需要再用姓名查一次。
   */
  if (row.hasAccount && row.studentNo) {
    return;
  }

  row.lookupLoading = true;

  const result = await lookupStudent({
    name,
  });

  row.lookupLoading = false;

  if (!result) {
    return;
  }

  row.hasAccount = result.has_account;
  row.nameMatches = result.matches;

  if (result.has_account && result.student_no && result.matches.length === 1) {
    row.studentNo = normalizeStudentNo(result.student_no);
    row.name = result.name ?? name;
    row.email = result.email ?? result.matches[0]?.email ?? '';
  }
}

function studentMatchOptions(row: StudentInputRow) {
  return row.nameMatches.map((match) => ({
    label: `${match.name}｜${match.student_no}`,
    value: match.student_no,
  }));
}

function selectNameMatch(row: StudentInputRow, value: string | null) {
  if (!value) {
    return;
  }

  const match = row.nameMatches.find((item) => item.student_no === value);

  if (!match) {
    return;
  }

  row.studentNo = normalizeStudentNo(match.student_no);
  row.name = match.name;
  row.hasAccount = true;
  row.email = match.email ?? '';
  row.nameMatches = [];
}

function validateEmail(value: string) {
  if (!value) {
    return true;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validateAddStudents(): string | null {
  if (addStudentRows.value.length === 0) {
    return '請至少輸入一位學生。';
  }

  if (addStudentRows.value.length > 100) {
    return '一次最多新增 100 位學生。';
  }

  const missingStudentNo = addStudentRows.value.find((row) => !row.studentNo.trim());

  if (missingStudentNo) {
    return '請完整填寫每一位學生的學號。';
  }

  const missingName = addStudentRows.value.find((row) => !row.hasAccount && !row.name.trim());

  if (missingName) {
    return '尚未開通的學生請填寫姓名。';
  }

  const invalidEmail = addStudentRows.value.find(
    (row) => row.email.trim() && !validateEmail(row.email.trim()),
  );

  if (invalidEmail) {
    return '請確認學生信箱格式是否正確。';
  }

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

  const hasExistingAccount = addStudentRows.value.some((row) => row.hasAccount);
  const hasNewAccountRequest = addStudentRows.value.some((row) => !row.hasAccount);

  const success = await addStudents(
    props.courseId,
    addStudentRows.value.map((row) => {
      const data: {
        student_no: string;
        name?: string;
        email?: string;
      } = {
        student_no: row.studentNo,
      };

      if (row.name.trim()) {
        data.name = row.name.trim();
      }

      /*
       * 已有正式帳號時 Backend 會沿用帳號資料，
       * 不送 email 避免前端誤蓋既有資料。
       */
      if (!row.hasAccount && row.email.trim()) {
        data.email = row.email.trim().toLowerCase();
      }

      return data;
    }),
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

  let message;

  if (hasExistingAccount && hasNewAccountRequest) {
    message = '學生新增成功：已有帳號者已直接加入課程，其餘學生已送出待審核';
  } else if (hasExistingAccount) {
    message = '學生新增成功，已有帳號的學生已直接加入課程';
  } else {
    message = '學生新增成功，已加入待審核名單';
  }

  Notify.create({
    type: 'positive',
    icon: 'check_circle',
    message,
    position: 'top',
    timeout: 2200,
  });
}

/*
 * ============================================================
 * Edit Student
 * ============================================================
 */
const editDialogOpen = ref(false);

const editingStudent = ref<CourseStudent | null>(null);

const editStudentNo = ref('');

const editName = ref('');

const editEmail = ref('');

const editEmailUsesDefault = ref(false);

const editErrorMessage = ref('');

function isDefaultStudentEmail(email: string, studentNo: string) {
  return email.trim().toLowerCase() === defaultStudentEmail(studentNo).toLowerCase();
}

function openEditDialog(student: CourseStudent) {
  clearErrorMessage();

  editingStudent.value = student;
  editStudentNo.value = student.student_no;
  editName.value = student.name;
  editEmail.value = student.email;
  editEmailUsesDefault.value = isDefaultStudentEmail(student.email, student.student_no);
  editErrorMessage.value = '';
  editDialogOpen.value = true;
}

function closeEditDialog() {
  if (updatingStudentId.value !== null) {
    return;
  }

  editDialogOpen.value = false;
  editingStudent.value = null;
  editErrorMessage.value = '';
  clearErrorMessage();
}

function updateEditStudentNo(value: string | number | null) {
  editStudentNo.value = normalizeStudentNo(value);

  /*
   * 原本就是預設校園信箱時，
   * 修改學號就同步更新信箱中的數字。
   */
  if (editEmailUsesDefault.value) {
    editEmail.value = defaultStudentEmail(editStudentNo.value);
  }
}

function updateEditEmail(value: string | number | null) {
  editEmail.value = String(value ?? '').trim();

  /*
   * 使用者親自修改信箱後，就不再自動跟著學號變動。
   * 若修改後剛好仍是目前學號的預設格式，則恢復同步模式。
   */
  editEmailUsesDefault.value = isDefaultStudentEmail(editEmail.value, editStudentNo.value);
}

function validateEditStudent(): string | null {
  if (!editStudentNo.value.trim()) {
    return '請輸入學生學號。';
  }

  if (!editName.value.trim()) {
    return '請輸入學生姓名。';
  }

  if (editEmail.value.trim() && !validateEmail(editEmail.value.trim())) {
    return '請確認學生信箱格式是否正確。';
  }

  return null;
}

async function submitEditStudent() {
  if (!editingStudent.value) {
    return;
  }

  const validationError = validateEditStudent();

  if (validationError) {
    editErrorMessage.value = validationError;

    return;
  }

  editErrorMessage.value = '';

  const payload: {
    student_no: string;
    name: string;
    email?: string;
  } = {
    student_no: editStudentNo.value,
    name: editName.value.trim(),
  };

  if (editEmail.value.trim()) {
    payload.email = editEmail.value.trim().toLowerCase();
  }

  const success = await updateStudent(props.courseId, editingStudent.value.id, payload);

  if (!success) {
    editErrorMessage.value = errorMessage.value || '學生資料修改失敗';
    clearErrorMessage();

    return;
  }

  const studentName = editingStudent.value.name;

  closeEditDialog();

  Notify.create({
    type: 'positive',
    icon: 'check_circle',
    message: `「${studentName}」資料已更新`,
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
