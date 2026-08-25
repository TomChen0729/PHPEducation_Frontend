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

        <h3 class="course-workspace-page__title text-weight-bold">
          {{ course?.name ?? '課程' }}
        </h3>

        <div v-if="course" class="course-workspace-page__semester">
          {{ formatSemester(course.semester) }}
        </div>
      </div>

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

      <q-tab-panels v-model="tab" animated class="course-workspace-page__panels">
        <!-- =========================
             Course Info
        ========================== -->
        <q-tab-panel name="info">
          <CourseInfoPanel
            ref="courseInfoPanelRef"
            :course="course"
            :loading="courseLoading"
            :saving="courseSaving"
            @save="handleSaveCourse"
          />
        </q-tab-panel>

        <!-- =========================
             Student MOCK
        ========================== -->
        <q-tab-panel name="students">
          <CourseStudentPanel
            :students="students"
            @add="handleAddStudent"
            @remove="removeMockStudent"
          />
        </q-tab-panel>

        <!-- =========================
             Material
        ========================== -->
        <q-tab-panel name="materials">
          <CourseMaterialPanel
            ref="materialPanelRef"
            :drafts="drafts"
            :published-topics="publishedTopics"
            :loading="materialLoading"
            :importing="importing"
            :downloading-template="downloadingTemplate"
            :creating-draft="creatingDraft"
            :publishing-draft-id="publishingDraftId"
            @download-template="handleDownloadTemplate"
            @import="handleImportMaterial"
            @view="openMaterialViewer"
            @edit="openMaterialEditor"
            @view-published="openPublishedMaterialViewer"
            @edit-published="handleEditPublishedTopic"
            @delete-draft-topic="handleDeleteDraftTopic"
            @delete-published-topic="handleDeletePublishedTopic"
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
              {{ editingTopicName ?? editingDraft?.name }}
            </div>

            <div class="text-caption text-grey-7">教材草稿編輯</div>
          </div>

          <q-btn flat round dense icon="close" :disable="editing" @click="closeMaterialEditor" />
        </q-card-section>

        <q-separator />

        <!-- Editor -->
        <q-card-section v-if="editingDraft" class="course-workspace-page__material-editor-content">
          <MaterialDraftEditor
            ref="materialEditorRef"
            :draft="editingDraft"
            :editing="editing"
            :error-message="materialErrorMessage"
            :topic-name="editingTopicName"
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

import type { MaterialDraft, PublishedTopic } from '../../../types/material';

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
  /*
   * Draft
   */
  drafts,

  /*
   * 正式 Published Topics
   */
  publishedTopics,

  /*
   * Loading
   */
  loading: materialLoading,

  downloadingTemplate,

  importing,

  creatingDraft,

  publishingDraftId,

  editing,

  /*
   * Error
   */
  errorMessage: materialErrorMessage,

  /*
   * Fetch
   */
  fetchDrafts,

  fetchPublishedTopics,

  /*
   * 取得一個正式 Topic
   * 的完整 Chapter / Unit /
   * Knowledge Card Tree。
   */
  fetchPublishedTopicTree,

  /*
   * Template / Import
   */
  downloadTemplate,

  importMaterial,

  /*
   * Draft
   */
  createDraftFromPublished,

  publishDraft,

  /*
   * =========================
   * Topic Delete
   * =========================
   */
  deleteDraftTopic,

  deletePublishedTopic,

  /*
   * =========================
   * Chapter
   * =========================
   */
  addChapter,

  updateChapter,

  deleteChapter,

  /*
   * =========================
   * Unit
   * =========================
   */
  addUnit,

  updateUnit,

  deleteUnit,

  /*
   * =========================
   * Knowledge Card
   * =========================
   */
  addKnowledgeCard,

  updateKnowledgeCard,

  deleteKnowledgeCard,

  /*
   * Clear
   */
  clearDrafts,

  clearErrorMessage: clearMaterialErrorMessage,
} = useTeacherMaterialManagement();

/*
 * =========================
 * Component Refs
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

const editingTopicName = ref<string | null>(null);

/*
 * =========================
 * Page Error
 * =========================
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

    /*
     * 進入課程時同時取得：
     *
     * 1. Course
     * 2. Draft
     * 3. 正式 Published Topics
     */
    await Promise.all([fetchCourse(id), fetchDrafts(id), fetchPublishedTopics(id)]);
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

    icon: 'check_circle',

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
    Notify.create({
      type: 'negative',

      icon: 'error_outline',

      message: materialErrorMessage.value || '教材範本下載失敗',

      position: 'top',

      timeout: 2500,
    });

    clearMaterialErrorMessage();

    return;
  }

  Notify.create({
    type: 'positive',

    icon: 'check_circle',

    message: '教材匯入範本下載完成',

    position: 'top',

    timeout: 1500,
  });
}

/*
 * =========================
 * Import Material
 * =========================
 */
async function handleImportMaterial(
  topic: string,

  file: File,
) {
  if (courseId.value === null) {
    return;
  }

  const draft = await importMaterial(courseId.value, topic, file);

  /*
   * Failed
   */
  if (!draft) {
    Notify.create({
      type: 'negative',

      icon: 'error_outline',

      message: materialErrorMessage.value || '教材匯入失敗',

      position: 'top',

      timeout: 2500,
    });

    clearMaterialErrorMessage();

    return;
  }

  /*
   * Success
   */
  materialPanelRef.value?.closeImportDialog();

  Notify.create({
    type: 'positive',

    icon: 'check_circle',

    message: `主題「${topic}」教材匯入成功`,

    position: 'top',

    timeout: 1800,
  });
}

/*
 * ============================================================
 * Draft Viewer
 * ============================================================
 */
function openMaterialViewer(draft: MaterialDraft) {
  selectedDraft.value = draft;

  materialViewerOpen.value = true;
}

/*
 * ============================================================
 * Published Topic Viewer
 * ============================================================
 *
 * 正式教材不再讀 Published Draft.tree。
 *
 * 改成：
 *
 * Topic
 * ↓
 * Chapters
 * ↓
 * Units
 * ↓
 * Knowledge Cards
 *
 * 最後轉成 MaterialTreeViewer
 * 可以使用的格式。
 */
async function openPublishedMaterialViewer(topic: PublishedTopic) {
  const draft = await fetchPublishedTopicTree(topic);

  if (!draft) {
    Notify.create({
      type: 'negative',

      icon: 'error_outline',

      message: materialErrorMessage.value || '已發布教材取得失敗',

      position: 'top',

      timeout: 2500,
    });

    clearMaterialErrorMessage();

    return;
  }

  selectedDraft.value = draft;

  materialViewerOpen.value = true;
}

/*
 * ============================================================
 * Draft Editor
 * ============================================================
 */
function openMaterialEditor(draft: MaterialDraft) {
  if (draft.status !== 'draft') {
    return;
  }

  clearMaterialErrorMessage();

  editingTopicName.value = draft.topics[0]?.name ?? null;

  editingDraft.value = draft;

  materialEditorOpen.value = true;
}

function closeMaterialEditor() {
  clearMaterialErrorMessage();

  materialEditorOpen.value = false;

  editingDraft.value = null;

  editingTopicName.value = null;
}

/*
 * ============================================================
 * Published Topic → Draft Editor
 * ============================================================
 *
 * 點某一個正式 Topic：
 *
 * 1. 從正式教材建立 Draft
 * 2. 指定要編輯的 Topic name
 * 3. 打開 MaterialDraftEditor
 */
async function handleEditPublishedTopic(topic: PublishedTopic) {
  if (courseId.value === null) {
    return;
  }

  const draft = await createDraftFromPublished(courseId.value);

  if (!draft) {
    Notify.create({
      type: 'negative',

      icon: 'error_outline',

      message: materialErrorMessage.value || '建立編輯草稿失敗',

      position: 'top',

      timeout: 2500,
    });

    clearMaterialErrorMessage();

    return;
  }

  /*
   * 確認建立出的 Draft
   * 裡面真的有這個 Topic。
   */
  const targetTopic = draft.topics.find((item) => item.name === topic.name);

  if (!targetTopic) {
    Notify.create({
      type: 'negative',

      icon: 'error_outline',

      message: `建立草稿成功，但找不到主題「${topic.name}」`,

      position: 'top',

      timeout: 2500,
    });

    return;
  }

  editingTopicName.value = targetTopic.name;

  editingDraft.value = draft;

  materialEditorOpen.value = true;

  Notify.create({
    type: 'positive',

    icon: 'check_circle',

    message: `「${topic.name}」已加入草稿編輯`,

    position: 'top',

    timeout: 1800,
  });
}

/*
 * =========================
 * Apply Updated Draft
 * =========================
 */
function applyUpdatedDraft(draft: MaterialDraft) {
  editingDraft.value = draft;

  materialEditorRef.value?.closeEditDialogs();
}

/*
 * =========================
 * Chapter CRUD
 * =========================
 */
async function handleAddChapter(
  topicId: string,

  name: string,
) {
  if (!editingDraft.value) {
    return;
  }

  const draft = await addChapter(editingDraft.value.id, topicId, {
    name,
  });

  if (!draft) {
    return;
  }

  applyUpdatedDraft(draft);
}

async function handleUpdateChapter(
  nodeId: string,

  name: string,
) {
  if (!editingDraft.value) {
    return;
  }

  const draft = await updateChapter(editingDraft.value.id, nodeId, {
    name,
  });

  if (!draft) {
    return;
  }

  applyUpdatedDraft(draft);
}

async function handleDeleteChapter(nodeId: string) {
  if (!editingDraft.value) {
    return;
  }

  const draft = await deleteChapter(editingDraft.value.id, nodeId);

  if (!draft) {
    return;
  }

  applyUpdatedDraft(draft);
}

/*
 * =========================
 * Unit CRUD
 * =========================
 */
async function handleAddUnit(
  chapterId: string,

  name: string,
) {
  if (!editingDraft.value) {
    return;
  }

  const draft = await addUnit(editingDraft.value.id, chapterId, {
    name,
  });

  if (!draft) {
    return;
  }

  applyUpdatedDraft(draft);
}

async function handleUpdateUnit(
  nodeId: string,

  name: string,
) {
  if (!editingDraft.value) {
    return;
  }

  const draft = await updateUnit(editingDraft.value.id, nodeId, {
    name,
  });

  if (!draft) {
    return;
  }

  applyUpdatedDraft(draft);
}

async function handleDeleteUnit(nodeId: string) {
  if (!editingDraft.value) {
    return;
  }

  const draft = await deleteUnit(editingDraft.value.id, nodeId);

  if (!draft) {
    return;
  }

  applyUpdatedDraft(draft);
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

  if (!draft) {
    return;
  }

  applyUpdatedDraft(draft);
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

  if (!draft) {
    return;
  }

  applyUpdatedDraft(draft);
}

async function handleDeleteCard(nodeId: string) {
  if (!editingDraft.value) {
    return;
  }

  const draft = await deleteKnowledgeCard(editingDraft.value.id, nodeId);

  if (!draft) {
    return;
  }

  applyUpdatedDraft(draft);
}

/*
 * ============================================================
 * Delete Draft Topic
 * ============================================================
 */
function handleDeleteDraftTopic(
  draftId: number,

  nodeId: string,

  topicName: string,
) {
  Dialog.create({
    title: '刪除草稿主題',

    message:
      `確定要刪除草稿主題「${topicName}」嗎？` + '主題底下的章節、單元與知識卡也會一併移除。',

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
    void performDeleteDraftTopic(draftId, nodeId, topicName);
  });
}

async function performDeleteDraftTopic(
  draftId: number,

  nodeId: string,

  topicName: string,
) {
  if (courseId.value === null) {
    return;
  }

  const success = await deleteDraftTopic(draftId, nodeId);

  if (!success) {
    Notify.create({
      type: 'negative',

      icon: 'error_outline',

      message: materialErrorMessage.value || '草稿主題刪除失敗',

      position: 'top',

      timeout: 2500,
    });

    clearMaterialErrorMessage();

    return;
  }

  await fetchDrafts(courseId.value);

  materialPanelRef.value?.closeDeleteTopicDialog();

  Notify.create({
    type: 'positive',

    icon: 'check_circle',

    message: `草稿主題「${topicName}」已刪除`,

    position: 'top',

    timeout: 1800,
  });
}

/*
 * ============================================================
 * Delete Published Topic
 * ============================================================
 */
function handleDeletePublishedTopic(
  topicId: number,

  topicName: string,
) {
  Dialog.create({
    title: '刪除已發布主題',

    message:
      `確定要刪除已發布主題「${topicName}」嗎？` + '主題底下的正式章節、單元與知識卡也會一併移除。',

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
    void performDeletePublishedTopic(topicId, topicName);
  });
}

async function performDeletePublishedTopic(
  topicId: number,

  topicName: string,
) {
  if (courseId.value === null) {
    return;
  }

  const success = await deletePublishedTopic(topicId);

  if (!success) {
    Notify.create({
      type: 'negative',

      icon: 'error_outline',

      message: materialErrorMessage.value || '已發布主題刪除失敗',

      position: 'top',

      timeout: 2500,
    });

    clearMaterialErrorMessage();

    return;
  }

  /*
   * 正式 Topic 刪除後，
   * 重新取得正式教材。
   */
  await fetchPublishedTopics(courseId.value);

  Notify.create({
    type: 'positive',

    icon: 'check_circle',

    message: `已發布主題「${topicName}」已刪除`,

    position: 'top',

    timeout: 1800,
  });
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
    Notify.create({
      type: 'negative',

      icon: 'error_outline',

      message: materialErrorMessage.value || '教材發布失敗',

      position: 'top',

      timeout: 2500,
    });

    clearMaterialErrorMessage();

    return;
  }

  /*
   * 發布後同時刷新：
   *
   * Draft
   * +
   * 正式 Topic
   */
  await Promise.all([fetchDrafts(courseId.value), fetchPublishedTopics(courseId.value)]);

  Notify.create({
    type: 'positive',

    icon: 'check_circle',

    message: `「${draft.name}」已發布`,

    position: 'top',

    timeout: 1500,
  });
}

/*
 * =========================
 * Published → Draft
 * =========================
 *
 * 保留原本整份正式教材
 * 建立 Draft 的功能。
 */
async function handleCreateDraft() {
  if (courseId.value === null) {
    return;
  }

  const draft = await createDraftFromPublished(courseId.value);

  if (!draft) {
    Notify.create({
      type: 'negative',

      icon: 'error_outline',

      message: materialErrorMessage.value || '建立編輯草稿失敗',

      position: 'top',

      timeout: 2500,
    });

    clearMaterialErrorMessage();

    return;
  }

  /*
   * 預設打開第一個 Topic。
   */
  editingTopicName.value = draft.topics[0]?.name ?? null;

  editingDraft.value = draft;

  materialEditorOpen.value = true;

  Notify.create({
    type: 'positive',

    icon: 'check_circle',

    message: `「${draft.name}」已建立新的編輯草稿`,

    position: 'top',

    timeout: 1500,
  });
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
