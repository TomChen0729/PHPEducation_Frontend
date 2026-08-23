<template>
  <q-page class="course-workspace-page">
    <!-- =========================
         Header
    ========================== -->
    <header class="course-workspace-page__header">
      <div>
        <q-btn
          flat
          dense
          icon="arrow_back"
          label="返回課程管理"
          color="blue"
          to="/teacher/courseManagement"
          class="course-workspace-page__back"
        />

        <h3 class="course-workspace-page__title">
          {{ course?.name ?? '課程' }}
        </h3>

        <div v-if="course" class="course-workspace-page__semester">
          {{ formatSemester(course.semester) }}
        </div>
      </div>

      <!-- 目前只有學生資料是假資料 -->
      <q-badge
        color="orange"
        text-color="white"
        label="學生管理目前為 MOCK"
        class="course-workspace-page__mock-badge"
      />
    </header>

    <!-- =========================
         Course Error
    ========================== -->
    <q-banner v-if="pageErrorMessage" rounded class="bg-red-1 text-negative q-mb-md">
      {{ pageErrorMessage }}
    </q-banner>

    <!-- =========================
         Workspace
    ========================== -->
    <q-card flat bordered class="course-workspace-page__container">
      <!-- Tabs -->
      <q-tabs
        v-model="tab"
        align="left"
        active-color="blue"
        indicator-color="blue"
        class="course-workspace-page__tabs"
      >
        <q-tab name="info" label="課程資訊" />

        <q-tab name="students" label="學生管理" />

        <q-tab name="materials" label="教材管理" />
      </q-tabs>

      <q-separator />

      <!-- =========================
           Panels
      ========================== -->
      <q-tab-panels v-model="tab" animated class="course-workspace-page__panels">
        <!-- Course -->
        <q-tab-panel name="info">
          <CourseInfoPanel
            ref="
              courseInfoPanelRef
            "
            :course="course"
            :loading="courseLoading"
            :saving="courseSaving"
            @save="handleSaveCourse"
          />
        </q-tab-panel>

        <!-- Student MOCK -->
        <q-tab-panel name="students">
          <CourseStudentPanel
            :students="students"
            @add="handleAddStudent"
            @remove="removeMockStudent"
          />
        </q-tab-panel>

        <!-- Material -->
        <q-tab-panel name="materials">
          <CourseMaterialPanel
            ref="
              materialPanelRef
            "
            :drafts="drafts"
            :loading="materialLoading"
            :importing="importing"
            :downloading-template="downloadingTemplate"
            :creating-draft="creatingDraft"
            :publishing-draft-id="publishingDraftId"
            :import-error-message="materialErrorMessage"
            @download-template="handleDownloadTemplate"
            @import="handleImportMaterial"
            @clear-import-error="clearMaterialErrorMessage"
            @view="openMaterialViewer"
            @edit="openMaterialEditor"
            @publish="requestPublish"
            @create-draft="handleCreateDraft"
          />
        </q-tab-panel>
      </q-tab-panels>
    </q-card>

    <!-- =========================
         Material Viewer
    ========================== -->
    <q-dialog v-model="materialViewerOpen">
      <q-card class="course-workspace-page__material-viewer">
        <q-card-section class="course-workspace-page__material-viewer-header">
          <div>
            <div class="text-h6">
              {{ selectedDraft?.name }}
            </div>

            <div class="text-caption text-grey-7">教材內容</div>
          </div>

          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section v-if="selectedDraft" class="course-workspace-page__material-viewer-content">
          <MaterialTreeViewer :draft="selectedDraft" />
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- =========================
         Material Editor
    ========================== -->
    <q-dialog v-model="materialEditorOpen" persistent>
      <q-card class="course-workspace-page__material-editor">
        <!-- Header -->
        <q-card-section class="course-workspace-page__material-editor-header">
          <div>
            <div class="text-h6">
              {{ editingDraft?.name }}
            </div>

            <div class="text-caption text-grey-7">教材草稿編輯</div>
          </div>

          <q-btn flat round dense icon="close" :disable="editing" @click="closeMaterialEditor" />
        </q-card-section>

        <q-separator />

        <!-- Editor -->
        <q-card-section v-if="editingDraft" class="course-workspace-page__material-editor-content">
          <MaterialDraftEditor
            ref="
              materialEditorRef
            "
            :draft="editingDraft"
            :editing="editing"
            :error-message="materialErrorMessage"
            @add-topic="handleAddTopic"
            @update-topic="handleUpdateTopic"
            @delete-topic="handleDeleteTopic"
            @add-chapter="handleAddChapter"
            @update-chapter="handleUpdateChapter"
            @delete-chapter="handleDeleteChapter"
            @add-unit="handleAddUnit"
            @update-unit="handleUpdateUnit"
            @delete-unit="handleDeleteUnit"
            @add-card="handleAddCard"
            @update-card="handleUpdateCard"
            @delete-card="handleDeleteCard"
          />
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import { useRoute } from 'vue-router';

import { Dialog, Notify } from 'quasar';

import CourseInfoPanel from '../../../components/teacher/course-workspace/CourseInfoPanel.vue';

import CourseStudentPanel from '../../../components/teacher/course-workspace/CourseStudentPanel.vue';

import CourseMaterialPanel from '../../../components/teacher/course-workspace/CourseMaterialPanel.vue';

import MaterialDraftEditor from '../../../components/teacher/course-workspace/MaterialDraftEditor.vue';

import MaterialTreeViewer from '../../../components/teacher/course-workspace/MaterialTreeViewer.vue';

import { useTeacherCourseWorkspace } from '../../../composables/useTeacherCourseWorkspace';

import { useTeacherMaterialManagement } from '../../../composables/useTeacherMaterialManagement';

import type { TeacherCourseRequest } from '../../../types/teacher-course-workspace';

import type { MaterialDraft } from '../../../types/material';

/*
 * =========================
 * Route
 * =========================
 */
const route = useRoute();

const courseId = computed<number | null>(() => {
  const params = route.params as Record<string, string | string[] | undefined>;

  const rawCourseId = params.courseId;

  if (!rawCourseId) {
    return null;
  }

  const value = Array.isArray(rawCourseId) ? rawCourseId[0] : rawCourseId;

  const id = Number(value);

  return Number.isNaN(id) ? null : id;
});

/*
 * =========================
 * Tab
 * =========================
 */
const tab = ref('info');

/*
 * =========================
 * Course
 * =========================
 */
const {
  course,

  courseLoading,
  courseSaving,

  courseErrorMessage,

  fetchCourse,
  updateCourse,

  /*
   * Student MOCK
   */
  students,

  addMockStudent,
  removeMockStudent,
} = useTeacherCourseWorkspace();

/*
 * =========================
 * Material
 * =========================
 */
const {
  drafts,

  loading: materialLoading,

  downloadingTemplate,

  importing,

  creatingDraft,

  publishingDraftId,

  editing,

  errorMessage: materialErrorMessage,

  fetchDrafts,

  downloadTemplate,

  importMaterial,

  createDraftFromPublished,

  publishDraft,

  /*
   * CRUD
   */
  addTopic,
  updateTopic,
  deleteTopic,

  addChapter,
  updateChapter,
  deleteChapter,

  addUnit,
  updateUnit,
  deleteUnit,

  addKnowledgeCard,
  updateKnowledgeCard,
  deleteKnowledgeCard,

  clearDrafts,

  clearErrorMessage: clearMaterialErrorMessage,
} = useTeacherMaterialManagement();

/*
 * =========================
 * Refs
 * =========================
 */
const courseInfoPanelRef = ref<InstanceType<typeof CourseInfoPanel> | null>(null);

const materialPanelRef = ref<InstanceType<typeof CourseMaterialPanel> | null>(null);

const materialEditorRef = ref<InstanceType<typeof MaterialDraftEditor> | null>(null);

/*
 * =========================
 * Viewer
 * =========================
 */
const materialViewerOpen = ref(false);

const selectedDraft = ref<MaterialDraft | null>(null);

/*
 * =========================
 * Editor
 * =========================
 */
const materialEditorOpen = ref(false);

const editingDraft = ref<MaterialDraft | null>(null);

/*
 * =========================
 * Page Error
 * =========================
 *
 * Material Import Error
 * 不顯示在頁面，
 * 會顯示在 Import Dialog。
 */
const pageErrorMessage = computed(() => {
  return courseErrorMessage.value;
});

/*
 * =========================
 * Init
 * =========================
 */
watch(
  courseId,

  async (id) => {
    if (id === null) {
      clearDrafts();

      return;
    }

    await Promise.all([fetchCourse(id), fetchDrafts(id)]);
  },

  {
    immediate: true,
  },
);

/*
 * =========================
 * Course Save
 * =========================
 */
async function handleSaveCourse(data: TeacherCourseRequest) {
  if (courseId.value === null) {
    return;
  }

  const success = await updateCourse(courseId.value, data);

  if (!success) {
    return;
  }

  courseInfoPanelRef.value?.closeEditDialog();

  Notify.create({
    type: 'positive',

    message: '課程資料修改成功',

    position: 'top',

    timeout: 1500,
  });
}

/*
 * =========================
 * Student MOCK
 * =========================
 */
function handleAddStudent(student: {
  studentNo: string;

  name: string;

  email: string;
}) {
  addMockStudent(student);

  Notify.create({
    type: 'warning',

    message: 'MOCK：學生僅加入前端畫面，尚未寫入資料庫',

    position: 'top',

    timeout: 1800,
  });
}

/*
 * =========================
 * Download Template
 * =========================
 */
async function handleDownloadTemplate() {
  const success = await downloadTemplate();

  if (!success) {
    return;
  }

  Notify.create({
    type: 'positive',

    message: '教材匯入範本下載完成',

    position: 'top',

    timeout: 1500,
  });
}

/*
 * =========================
 * Import
 * =========================
 */
async function handleImportMaterial(file: File) {
  if (courseId.value === null) {
    return;
  }

  const draft = await importMaterial(courseId.value, file);

  /*
   * Failed
   *
   * Dialog 保持開啟，
   * 錯誤顯示在 Dialog。
   */
  if (!draft) {
    return;
  }

  /*
   * Success
   *
   * Loading 完成後
   * 自動關閉 Dialog。
   */
  materialPanelRef.value?.closeImportDialog();

  Notify.create({
    type: 'positive',

    message: `「${draft.name}」匯入成功，已建立草稿`,

    position: 'top',

    timeout: 1800,
  });
}

/*
 * =========================
 * Viewer
 * =========================
 */
function openMaterialViewer(draft: MaterialDraft) {
  selectedDraft.value = draft;

  materialViewerOpen.value = true;
}

/*
 * =========================
 * Editor
 * =========================
 */
function openMaterialEditor(draft: MaterialDraft) {
  if (draft.status !== 'draft') {
    return;
  }

  clearMaterialErrorMessage();

  editingDraft.value = draft;

  materialEditorOpen.value = true;
}

function closeMaterialEditor() {
  clearMaterialErrorMessage();

  materialEditorOpen.value = false;

  editingDraft.value = null;
}

/*
 * Backend 每次回傳完整 Draft，
 * 直接用最新 Draft 覆蓋。
 */
function applyUpdatedDraft(draft: MaterialDraft) {
  editingDraft.value = draft;

  materialEditorRef.value?.closeEditDialogs();
}

/*
 * =========================
 * Topic CRUD
 * =========================
 */
async function handleAddTopic(name: string) {
  if (!editingDraft.value) {
    return;
  }

  const draft = await addTopic(editingDraft.value.id, {
    name,
  });

  if (draft) {
    applyUpdatedDraft(draft);
  }
}

async function handleUpdateTopic(nodeId: string, name: string) {
  if (!editingDraft.value) {
    return;
  }

  const draft = await updateTopic(editingDraft.value.id, nodeId, {
    name,
  });

  if (draft) {
    applyUpdatedDraft(draft);
  }
}

async function handleDeleteTopic(nodeId: string) {
  if (!editingDraft.value) {
    return;
  }

  const draft = await deleteTopic(editingDraft.value.id, nodeId);

  if (draft) {
    applyUpdatedDraft(draft);
  }
}

/*
 * =========================
 * Chapter CRUD
 * =========================
 */
async function handleAddChapter(topicId: string, name: string) {
  if (!editingDraft.value) {
    return;
  }

  const draft = await addChapter(editingDraft.value.id, topicId, {
    name,
  });

  if (draft) {
    applyUpdatedDraft(draft);
  }
}

async function handleUpdateChapter(nodeId: string, name: string) {
  if (!editingDraft.value) {
    return;
  }

  const draft = await updateChapter(editingDraft.value.id, nodeId, {
    name,
  });

  if (draft) {
    applyUpdatedDraft(draft);
  }
}

async function handleDeleteChapter(nodeId: string) {
  if (!editingDraft.value) {
    return;
  }

  const draft = await deleteChapter(editingDraft.value.id, nodeId);

  if (draft) {
    applyUpdatedDraft(draft);
  }
}

/*
 * =========================
 * Unit CRUD
 * =========================
 */
async function handleAddUnit(chapterId: string, name: string) {
  if (!editingDraft.value) {
    return;
  }

  const draft = await addUnit(editingDraft.value.id, chapterId, {
    name,
  });

  if (draft) {
    applyUpdatedDraft(draft);
  }
}

async function handleUpdateUnit(nodeId: string, name: string) {
  if (!editingDraft.value) {
    return;
  }

  const draft = await updateUnit(editingDraft.value.id, nodeId, {
    name,
  });

  if (draft) {
    applyUpdatedDraft(draft);
  }
}

async function handleDeleteUnit(nodeId: string) {
  if (!editingDraft.value) {
    return;
  }

  const draft = await deleteUnit(editingDraft.value.id, nodeId);

  if (draft) {
    applyUpdatedDraft(draft);
  }
}

/*
 * =========================
 * Knowledge Card CRUD
 * =========================
 */
async function handleAddCard(
  unitId: string,

  data: {
    title: string;

    content: string;

    example: string | null;
  },
) {
  if (!editingDraft.value) {
    return;
  }

  const draft = await addKnowledgeCard(editingDraft.value.id, unitId, data);

  if (draft) {
    applyUpdatedDraft(draft);
  }
}

async function handleUpdateCard(
  nodeId: string,

  data: {
    title: string;

    content: string;

    example: string | null;
  },
) {
  if (!editingDraft.value) {
    return;
  }

  const draft = await updateKnowledgeCard(editingDraft.value.id, nodeId, data);

  if (draft) {
    applyUpdatedDraft(draft);
  }
}

async function handleDeleteCard(nodeId: string) {
  if (!editingDraft.value) {
    return;
  }

  const draft = await deleteKnowledgeCard(editingDraft.value.id, nodeId);

  if (draft) {
    applyUpdatedDraft(draft);
  }
}

/*
 * =========================
 * Publish
 * =========================
 */
function requestPublish(draft: MaterialDraft) {
  Dialog.create({
    title: '發布教材',

    message: `確定要將「${draft.name}」發布為正式教材嗎？`,

    cancel: {
      label: '取消',

      flat: true,
    },

    ok: {
      label: '確認發布',

      color: 'blue',
    },

    persistent: true,
  }).onOk(() => {
    void handlePublish(draft);
  });
}

async function handlePublish(draft: MaterialDraft) {
  if (courseId.value === null) {
    return;
  }

  const success = await publishDraft(courseId.value, draft.id);

  if (!success) {
    return;
  }

  Notify.create({
    type: 'positive',

    message: `「${draft.name}」已發布`,

    position: 'top',

    timeout: 1500,
  });
}

/*
 * =========================
 * Published → Draft
 * =========================
 */
async function handleCreateDraft() {
  if (courseId.value === null) {
    return;
  }

  const draft = await createDraftFromPublished(courseId.value);

  if (!draft) {
    return;
  }

  Notify.create({
    type: 'positive',

    message: `「${draft.name}」已建立新的編輯草稿`,

    position: 'top',

    timeout: 1500,
  });

  /*
   * 建完直接進編輯器
   */
  openMaterialEditor(draft);
}

/*
 * =========================
 * Semester
 * =========================
 */
function formatSemester(semester: string) {
  const [year, term] = semester.split('-');

  const termText = term === '1' ? '上學期' : term === '2' ? '下學期' : '';

  return `${year} 學年度・${termText}`;
}
</script>
