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

        <h5 class="course-workspace-page__title text-weight-bold">
          {{ course?.name ?? '課程' }}
        </h5>

        <div v-if="course" class="course-workspace-page__semester">
          {{ formatSemester(course.semester) }}
        </div>
      </div>
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

        <q-tab name="students" label="班級學生" />

        <q-tab name="materials" label="教材管理" />

        <q-tab name="questions" label="題庫管理" />
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
             Student
        ========================== -->
        <q-tab-panel name="students">
          <CourseStudentPanel
            v-if="courseId !== null"
            :course-id="courseId"
            :class-name="course?.class_name ?? ''"
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
          />
        </q-tab-panel>

        <q-tab-panel name="questions">
          <CourseQuestionPanel v-if="courseId !== null" :course-id="courseId" />
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
              {{ selectedDraft?.topics[0]?.name ?? selectedDraft?.name }}
            </div>

            <div class="text-caption text-grey-7">教材內容</div>
          </div>

          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-card-section v-if="selectedDraft" class="course-workspace-page__material-viewer-content">
          <MaterialTreeViewer :topic="selectedDraft.topics[0] ?? null" theme="teacher" />
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- =========================
         Material Editor
    ========================== -->
    <q-dialog
      v-model="materialEditorOpen"
      transition-show="slide-up"
      transition-hide="slide-down"
      persistent
    >
      <q-card class="course-workspace-page__material-editor">
        <!-- Header -->
        <q-card-section class="course-workspace-page__material-editor-header flex justify-between">
          <div>
            <div class="text-h6">
              {{ editingDraft?.topics[0]?.name ?? editingDraft?.name }}
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

import MaterialTreeViewer from '../../../components/material/MaterialTreeViewer.vue';

import CourseQuestionPanel from '../../../components/teacher/course-workspace/CourseQuestionPanel.vue';

import { useTeacherCourseWorkspace } from '../../../composables/useTeacherCourseWorkspace';

import { useTeacherMaterialManagement } from '../../../composables/useTeacherMaterialManagement';

import type { CourseRequest } from '../../../types/course';

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
} = useTeacherCourseWorkspace();

/*
 * =========================
 * Material
 * =========================
 */
const {
  /*
   * Data
   */
  drafts,

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

  fetchPublishedTopicTree,

  /*
   * Import
   */
  downloadTemplate,

  importMaterial,

  /*
   * Draft / Publish
   */
  createDraftFromPublished,

  publishDraft,

  /*
   * Topic
   */
  deleteDraftTopic,

  deletePublishedTopic,

  /*
   * Chapter
   */
  addChapter,

  updateChapter,

  deleteChapter,

  /*
   * Unit
   */
  addUnit,

  updateUnit,

  deleteUnit,

  /*
   * Knowledge Card
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
async function handleSaveCourse(data: CourseRequest) {
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
   * API 成功後才關閉匯入 Dialog。
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
 * Viewer
 * ============================================================
 */
function openMaterialViewer(draft: MaterialDraft) {
  selectedDraft.value = draft;

  materialViewerOpen.value = true;
}

/*
 * 已發布 Topic 需要先取得正式教材完整 Tree，
 * 再交給共用 Viewer。
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

  /*
   * 共用 Viewer。
   */
  openMaterialViewer(draft);
}

/*
 * ============================================================
 * Editor
 * ============================================================
 */
function openMaterialEditor(draft: MaterialDraft) {
  /*
   * 只有 Draft 可以直接編輯。
   */
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
 * ============================================================
 * Published Topic → Draft
 * ============================================================
 *
 * 每次只將點選的 Published Topic
 * 建立成一份 Draft。
 */
async function handleEditPublishedTopic(topic: PublishedTopic) {
  if (courseId.value === null) {
    return;
  }

  const draft = await createDraftFromPublished(courseId.value, topic.id);

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
   * 防呆：
   * 正常情況一份 Draft
   * 應只有目前選擇的 Topic。
   */
  if (draft.topics.length === 0) {
    Notify.create({
      type: 'negative',

      icon: 'error_outline',

      message: '建立草稿成功，但草稿中沒有教材主題',

      position: 'top',

      timeout: 2500,
    });

    return;
  }

  /*
   * 使用共用 Editor。
   */
  openMaterialEditor(draft);

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

  /*
   * API 成功後才關閉
   * Chapter / Unit / Card
   * 新增或修改 Dialog。
   */
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
 * ============================================================
 * Publish
 * ============================================================
 */
function requestPublish(draft: MaterialDraft) {
  Dialog.create({
    title: '發布教材',

    message: `確定要將「${draft.topics[0]?.name ?? draft.name}」發布為正式教材嗎？`,

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
   * 發布後刷新：
   *
   * 1. Draft
   * 2. Published Topic
   */
  await Promise.all([fetchDrafts(courseId.value), fetchPublishedTopics(courseId.value)]);

  Notify.create({
    type: 'positive',

    icon: 'check_circle',

    message: `「${draft.topics[0]?.name ?? draft.name}」已發布`,

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
