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

        <h5 class="text-weight-bold course-workspace-page__title">
          {{ course?.name ?? '課程' }}
        </h5>

        <div v-if="course" class="course-workspace-page__semester">
          {{ formatSemester(course.semester) }}
        </div>
      </div>
    </header>

    <!-- =========================
         Error
    ========================== -->
    <q-banner v-if="pageErrorMessage" rounded class="bg-red-1 text-negative q-mb-md">
      {{ pageErrorMessage }}
    </q-banner>

    <!-- =========================
         Course Workspace
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

      <!-- Panels -->
      <q-tab-panels v-model="tab" animated class="course-workspace-page__panels">
        <!-- =====================
             Course API
        ====================== -->
        <q-tab-panel name="info">
          <CourseInfoPanel
            ref="courseInfoPanelRef"
            :course="course"
            :loading="courseLoading"
            :saving="courseSaving"
            @save="handleSaveCourse"
          />
        </q-tab-panel>

        <!-- =====================
             Student MOCK
        ====================== -->
        <q-tab-panel name="students">
          <CourseStudentPanel
            :students="students"
            @add="handleAddStudent"
            @remove="removeMockStudent"
          />
        </q-tab-panel>

        <!-- =====================
             Material API
        ====================== -->
        <q-tab-panel name="materials">
          <CourseMaterialPanel
            ref="materialPanelRef"
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
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import { useRoute } from 'vue-router';

import { Dialog, Notify } from 'quasar';

import CourseInfoPanel from '../../../components/teacher/course-workspace/CourseInfoPanel.vue';

import CourseStudentPanel from '../../../components/teacher/course-workspace/CourseStudentPanel.vue';

import CourseMaterialPanel from '../../../components/teacher/course-workspace/CourseMaterialPanel.vue';

import MaterialTreeViewer from '../../../components/teacher/course-workspace/MaterialTreeViewer.vue';

import { useTeacherCourseWorkspace } from '../../../composables/useTeacherCourseWorkspace';

import { useTeacherMaterialManagement } from '../../../composables/useTeacherMaterialManagement.js';

import type { CourseRequest } from '../../../types/course';

import type { MaterialDraft } from '../../../types/material';

const route = useRoute();

/*
 * =========================
 * Course ID
 * =========================
 *
 * 同時解決你前面遇到的：
 *
 * Property 'courseId'
 * does not exist...
 */
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

  errorMessage: materialErrorMessage,

  fetchDrafts,
  downloadTemplate,
  importMaterial,
  createDraftFromPublished,
  publishDraft,
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

/*
 * =========================
 * Material Viewer
 * =========================
 */
const materialViewerOpen = ref(false);

const selectedDraft = ref<MaterialDraft | null>(null);

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
 * Course ID Change
 * =========================
 *
 * 進頁面或切換動態路由時：
 *
 * 1. GET Course
 * 2. GET Material Drafts
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
 * Save Course
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
 * Template
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
 * Import Material
 * =========================
 */
async function handleImportMaterial(file: File) {
  if (courseId.value === null) {
    return;
  }

  const draft = await importMaterial(courseId.value, file);

  /*
   * 匯入失敗
   * → Dialog 保留
   * → 讓老師可以看到錯誤後重新選檔
   */
  if (!draft) {
    return;
  }

  /*
   * 匯入成功
   * → 自動關閉匯入 Dialog
   * → 同時清除 QFile
   */
  materialPanelRef.value?.closeImportDialog();

  Notify.create({
    type: 'positive',

    message: `「${draft.name}」匯入成功，已建立草稿`,

    position: 'top',

    timeout: 1800,
  });

  /*
   * 匯入成功後直接打開教材內容
   */
  openMaterialViewer(draft);
}

/*
 * =========================
 * View Material
 * =========================
 */
function openMaterialViewer(draft: MaterialDraft) {
  selectedDraft.value = draft;

  materialViewerOpen.value = true;
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

  materialViewerOpen.value = false;

  selectedDraft.value = null;

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

  openMaterialViewer(draft);
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
