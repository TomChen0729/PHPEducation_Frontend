<template>
  <q-page class="course-workspace-page">
    <!-- Header -->
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

    <q-banner v-if="pageErrorMessage" rounded class="bg-red-1 text-negative q-mb-md">
      {{ pageErrorMessage }}
    </q-banner>

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
        <!-- Course -->
        <q-tab-panel name="info">
          <CourseInfoPanel
            ref="courseInfoPanelRef"
            :course="course"
            :loading="courseLoading"
            :saving="courseSaving"
            @save="handleSaveCourse"
          />
        </q-tab-panel>

        <!-- Students -->
        <q-tab-panel name="students">
          <CourseStudentPanel
            v-if="courseId !== null"
            :course-id="courseId"
            :class-name="course?.class_name ?? ''"
          />
        </q-tab-panel>

        <!-- Materials -->
        <q-tab-panel name="materials">
          <CourseMaterialPanel
            ref="materialPanelRef"
            :course-name="course?.name ?? ''"
            :has-material="hasMaterial"
            :chapter-count="chapterCount"
            :unit-count="unitCount"
            :knowledge-card-count="knowledgeCardCount"
            :loading="materialLoading"
            :importing="importing"
            :downloading-template="downloadingTemplate"
            :editing="editing"
            :error-message="materialErrorMessage"
            @download-template="handleDownloadTemplate"
            @import="handleImportMaterial"
            @view="openMaterialViewer"
            @edit="openMaterialEditor"
            @clear-error="clearMaterialErrorMessage"
          />
        </q-tab-panel>

        <!-- Questions -->
        <q-tab-panel name="questions">
          <CourseQuestionPanel v-if="courseId !== null" :course-id="courseId" />
        </q-tab-panel>
      </q-tab-panels>
    </q-card>

    <!-- Material Viewer -->
    <q-dialog v-model="materialViewerOpen">
      <q-card class="course-workspace-page__material-viewer">
        <q-card-section class="course-workspace-page__material-viewer-header">
          <div>
            <div class="text-h6">
              {{ course?.name ?? '教材' }}
            </div>

            <div class="text-caption text-grey-7">正式教材</div>
          </div>

          <div class="course-workspace-page__material-viewer-actions">
            <q-btn-toggle
              v-model="materialViewMode"
              unelevated
              no-caps
              color="grey-2"
              text-color="blue-grey-8"
              toggle-color="blue"
              toggle-text-color="white"
              :options="[
                {
                  label: '階層檢視',
                  value: 'tree',
                  icon: 'account_tree',
                },
                {
                  label: '圖譜檢視',
                  value: 'graph',
                  icon: 'hub',
                },
              ]"
            />

            <q-btn flat round dense icon="close" v-close-popup />
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section class="course-workspace-page__material-viewer-content">
          <MaterialTreeViewer
            v-if="materialViewMode === 'tree' && courseTree"
            :tree="courseTree"
            theme="teacher"
          />

          <MaterialGraphViewer
            v-else-if="materialViewMode === 'graph' && courseTree"
            :tree="courseTree"
            theme="teacher"
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Material Editor -->
    <q-dialog v-model="materialEditorOpen" persistent>
      <q-card class="course-workspace-page__material-editor">
        <q-card-section class="course-workspace-page__material-editor-header">
          <div>
            <div class="row items-center q-gutter-sm">
              <div class="text-h6">
                {{ course?.name ?? '教材' }}
              </div>

              <q-badge color="positive" label="正式教材" />
            </div>

            <div class="text-caption text-grey-7">教材編輯</div>
          </div>

          <q-btn
            flat
            round
            dense
            icon="close"
            :disable="editing"
            @click="requestCloseMaterialEditor"
          />
        </q-card-section>

        <q-separator />

        <q-card-section class="course-workspace-page__material-editor-content">
          <MaterialEditor
            v-if="courseTree"
            ref="materialEditorRef"
            :course-tree="courseTree"
            :editing="editing"
            :upload-image="uploadEditorImage"
            :error-message="materialErrorMessage"
            @create-chapter="handleCreateChapter"
            @update-chapter="handleUpdateChapter"
            @delete-chapter="handleDeleteChapter"
            @create-unit="handleCreateUnit"
            @update-unit="handleUpdateUnit"
            @delete-unit="handleDeleteUnit"
            @create-card="handleCreateCard"
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

import CourseQuestionPanel from '../../../components/teacher/course-workspace/CourseQuestionPanel.vue';

import MaterialTreeViewer from '../../../components/material/MaterialTreeViewer.vue';

import MaterialEditor from '../../../components/teacher/course-workspace/MaterialEditor.vue';

import MaterialGraphViewer from '../../../components/material/MaterialGraphViewer.vue';

import { useTeacherCourseWorkspace } from '../../../composables/useTeacherCourseWorkspace';

import { useTeacherMaterialManagement } from '../../../composables/useTeacherMaterialManagement';

import type { CourseRequest } from '../../../types/course';

import type { KnowledgeCardPayload, MaterialNamePayload } from '../../../types/material';

type MaterialViewMode = 'tree' | 'graph';

const materialViewMode = ref<MaterialViewMode>('tree');

const route = useRoute();

const courseId = computed<number | null>(() => {
  const params = route.params as Record<string, string | string[] | undefined>;

  const raw = params.courseId;

  if (!raw) {
    return null;
  }

  const value = Array.isArray(raw) ? raw[0] : raw;

  const id = Number(value);

  return Number.isNaN(id) ? null : id;
});

const tab = ref('info');

const { course, courseLoading, courseSaving, courseErrorMessage, fetchCourse, updateCourse } =
  useTeacherCourseWorkspace();

const {
  courseTree,
  hasMaterial,

  chapterCount,
  unitCount,
  knowledgeCardCount,

  loading: materialLoading,

  downloadingTemplate,
  importing,
  editing,

  errorMessage: materialErrorMessage,

  fetchCourseTree,
  downloadTemplate,
  importMaterial,

  createChapter,
  updateChapter,
  deleteChapter,

  createUnit,
  updateUnit,
  deleteUnit,

  createKnowledgeCard,
  updateKnowledgeCard,
  deleteKnowledgeCard,
  uploadEditorImage,

  clearMaterial,
  clearErrorMessage: clearMaterialErrorMessage,
} = useTeacherMaterialManagement();

const courseInfoPanelRef = ref<InstanceType<typeof CourseInfoPanel> | null>(null);

const materialPanelRef = ref<InstanceType<typeof CourseMaterialPanel> | null>(null);

const materialViewerOpen = ref(false);

const pageErrorMessage = computed(() => courseErrorMessage.value);

const materialEditorOpen = ref(false);

const materialEditorRef = ref<InstanceType<typeof MaterialEditor> | null>(null);

watch(
  courseId,

  async (id) => {
    if (id === null) {
      clearMaterial();

      return;
    }

    await Promise.all([fetchCourse(id), fetchCourseTree(id)]);
  },

  {
    immediate: true,
  },
);

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

async function handleImportMaterial(
  file: File,

  overwrite: boolean,
) {
  if (courseId.value === null || !course.value) {
    return;
  }

  const success = await importMaterial(courseId.value, file, overwrite);

  if (!success) {
    Notify.create({
      type: 'negative',
      icon: 'error_outline',
      message: materialErrorMessage.value || '教材匯入失敗',
      position: 'top',
      timeout: 2500,
    });

    return;
  }

  materialPanelRef.value?.closeImportDialog();

  Notify.create({
    type: 'positive',
    icon: 'check_circle',
    message: overwrite ? '教材重新匯入成功' : '教材匯入成功',
    position: 'top',
    timeout: 1800,
  });
}

function openMaterialViewer() {
  if (!courseTree.value) {
    return;
  }

  materialViewMode.value = 'tree';

  materialViewerOpen.value = true;
}

async function handleCreateChapter(courseIdValue: number, data: MaterialNamePayload) {
  const success = await createChapter(courseIdValue, data);

  if (!success) {
    return;
  }

  materialEditorRef.value?.closeNameDialog();

  notifyMaterialSuccess('章節新增成功');
}

async function handleUpdateChapter(
  chapterId: number,

  data: MaterialNamePayload,
) {
  const success = await updateChapter(chapterId, data);

  if (!success) {
    return;
  }

  materialEditorRef.value?.closeNameDialog();

  notifyMaterialSuccess('章節修改成功');
}

async function handleDeleteChapter(chapterId: number) {
  const success = await deleteChapter(chapterId);

  if (!success) {
    return;
  }

  notifyMaterialSuccess('章節已刪除');
}

function formatSemester(semester: string) {
  const [year, term] = semester.split('-');

  const termText = term === '1' ? '上學期' : term === '2' ? '下學期' : '';

  return `${year} 學年度・${termText}`;
}

async function handleCreateUnit(
  chapterId: number,

  data: MaterialNamePayload,
) {
  const success = await createUnit(chapterId, data);

  if (!success) {
    return;
  }

  materialEditorRef.value?.closeNameDialog();

  notifyMaterialSuccess('單元新增成功');
}

async function handleUpdateUnit(
  unitId: number,

  data: MaterialNamePayload,
) {
  const success = await updateUnit(unitId, data);

  if (!success) {
    return;
  }

  materialEditorRef.value?.closeNameDialog();

  notifyMaterialSuccess('單元修改成功');
}

async function handleDeleteUnit(unitId: number) {
  const success = await deleteUnit(unitId);

  if (!success) {
    return;
  }

  notifyMaterialSuccess('單元已刪除');
}

async function handleCreateCard(
  unitId: number,

  data: KnowledgeCardPayload,
) {
  const success = await createKnowledgeCard(unitId, data);

  if (!success) {
    return;
  }

  materialEditorRef.value?.finishCardSave();

  notifyMaterialSuccess('知識卡新增成功');
}

async function handleUpdateCard(
  cardId: number,

  data: KnowledgeCardPayload,
) {
  const success = await updateKnowledgeCard(cardId, data);

  if (!success) {
    return;
  }

  materialEditorRef.value?.finishCardSave();

  notifyMaterialSuccess('教材內容已儲存');
}

async function handleDeleteCard(cardId: number) {
  const success = await deleteKnowledgeCard(cardId);

  if (!success) {
    return;
  }

  materialEditorRef.value?.handleDeletedCard(cardId);

  notifyMaterialSuccess('知識卡已刪除');
}

function openMaterialEditor() {
  if (!courseTree.value) {
    return;
  }

  clearMaterialErrorMessage();

  materialEditorOpen.value = true;
}

function requestCloseMaterialEditor() {
  if (!materialEditorRef.value?.hasUnsavedChanges()) {
    closeMaterialEditor();

    return;
  }

  Dialog.create({
    title: '尚未儲存',

    message: '目前還有尚未儲存的教材內容，確定要離開嗎？',

    cancel: {
      label: '繼續編輯',
      flat: true,
    },

    ok: {
      label: '離開',
      color: 'negative',
    },

    persistent: true,
  }).onOk(() => {
    closeMaterialEditor();
  });
}

function closeMaterialEditor() {
  clearMaterialErrorMessage();

  materialEditorOpen.value = false;
}

function notifyMaterialSuccess(message: string) {
  Notify.create({
    type: 'positive',
    icon: 'check_circle',
    message,
    position: 'top',
    timeout: 1500,
  });
}
</script>
