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
            :course-tree="courseTree"
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
            @clear-error="clearMaterialErrorMessage"
            @create-chapter="openCreateChapter"
            @edit-chapter="openEditChapter"
            @delete-chapter="requestDeleteChapter"
            @create-unit="openCreateUnit"
            @edit-unit="openEditUnit"
            @delete-unit="requestDeleteUnit"
            @create-card="openCreateCard"
            @edit-card="openEditCard"
            @delete-card="requestDeleteCard"
          />
        </q-tab-panel>

        <!-- Questions -->
        <q-tab-panel name="questions">
          <CourseQuestionPanel v-if="courseId !== null" :course-id="courseId" />
        </q-tab-panel>
      </q-tab-panels>
    </q-card>

    <!-- Material Editor -->
    <q-dialog v-model="materialEditorOpen" persistent>
      <q-card
        class="course-workspace-page__material-editor"
        :class="{
          'course-workspace-page__material-editor--compact':
            materialEditorContext?.kind === 'chapter' || materialEditorContext?.kind === 'unit',
          'course-workspace-page__material-editor--card': materialEditorContext?.kind === 'card',
        }"
      >
        <q-card-section class="course-workspace-page__material-editor-header">
          <div>
            <div class="text-h6">教材編輯</div>

            <div class="text-caption text-grey-7">
              {{ course?.name ?? '' }}
            </div>
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
            ref="materialEditorRef"
            :context="materialEditorContext"
            :course-name="course?.name ?? ''"
            :editing="editing"
            :error-message="materialErrorMessage"
            :upload-image="uploadEditorImage"
            @submit="handleMaterialEditorSubmit"
            @cancel="requestCloseMaterialEditor"
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

import MaterialEditor from '../../../components/teacher/course-workspace/MaterialEditor.vue';

import { useTeacherCourseWorkspace } from '../../../composables/useTeacherCourseWorkspace';

import { useTeacherMaterialManagement } from '../../../composables/useTeacherMaterialManagement';

import type { CourseRequest } from '../../../types/course';

import type {
  MaterialChapterNode,
  MaterialEditorContext,
  MaterialEditorSubmitPayload,
  MaterialKnowledgeCardNode,
  MaterialUnitNode,
} from '../../../types/material';

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

const pageErrorMessage = computed(() => courseErrorMessage.value);

const materialEditorOpen = ref(false);

const materialEditorContext = ref<MaterialEditorContext | null>(null);

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

async function handleMaterialEditorSubmit(payload: MaterialEditorSubmitPayload) {
  let success = false;

  let message = '';

  if (payload.kind === 'chapter' && payload.mode === 'create') {
    success = await createChapter(payload.courseId, payload.data);

    message = '章節新增成功';
  }

  if (payload.kind === 'chapter' && payload.mode === 'edit') {
    success = await updateChapter(payload.chapterId, payload.data);

    message = '章節修改成功';
  }

  if (payload.kind === 'unit' && payload.mode === 'create') {
    success = await createUnit(payload.chapterId, payload.data);

    message = '單元新增成功';
  }

  if (payload.kind === 'unit' && payload.mode === 'edit') {
    success = await updateUnit(payload.unitId, payload.data);

    message = '單元修改成功';
  }

  if (payload.kind === 'card' && payload.mode === 'create') {
    success = await createKnowledgeCard(payload.unitId, payload.data);

    message = '知識卡新增成功';
  }

  if (payload.kind === 'card' && payload.mode === 'edit') {
    success = await updateKnowledgeCard(payload.cardId, payload.data);

    message = '教材內容已儲存';
  }

  if (!success) {
    return;
  }

  closeMaterialEditor();

  Notify.create({
    type: 'positive',

    icon: 'check_circle',

    message,

    position: 'top',

    timeout: 1500,
  });
}

function formatSemester(semester: string) {
  const [year, term] = semester.split('-');

  const termText = term === '1' ? '上學期' : term === '2' ? '下學期' : '';

  return `${year} 學年度・${termText}`;
}

function requestCloseMaterialEditor() {
  if (!materialEditorRef.value?.hasUnsavedChanges()) {
    closeMaterialEditor();

    return;
  }

  Dialog.create({
    title: '尚未儲存',

    message: '目前的教材內容尚未儲存，確定要離開嗎？',

    cancel: {
      label: '繼續編輯',

      flat: true,
    },

    ok: {
      label: '離開',

      color: 'negative',
    },

    persistent: true,
  }).onOk(closeMaterialEditor);
}

function closeMaterialEditor() {
  materialEditorOpen.value = false;

  materialEditorContext.value = null;

  clearMaterialErrorMessage();
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

function nextOrder(items: { sort_order: number }[]) {
  if (items.length === 0) {
    return 1;
  }

  return Math.max(...items.map((item) => item.sort_order)) + 1;
}

function openCreateChapter() {
  if (!courseTree.value) {
    return;
  }

  materialEditorContext.value = {
    kind: 'chapter',

    mode: 'create',

    courseId: courseTree.value.id,

    nextOrder: nextOrder(courseTree.value.chapters),
  };

  materialEditorOpen.value = true;
}

function openEditChapter(chapter: MaterialChapterNode) {
  materialEditorContext.value = {
    kind: 'chapter',

    mode: 'edit',

    chapter,
  };

  materialEditorOpen.value = true;
}

function openCreateUnit(chapter: MaterialChapterNode) {
  materialEditorContext.value = {
    kind: 'unit',

    mode: 'create',

    chapter,

    nextOrder: nextOrder(chapter.units),
  };

  materialEditorOpen.value = true;
}

function openEditUnit(
  chapter: MaterialChapterNode,

  unit: MaterialUnitNode,
) {
  materialEditorContext.value = {
    kind: 'unit',

    mode: 'edit',

    chapter,

    unit,
  };

  materialEditorOpen.value = true;
}

function openCreateCard(
  chapter: MaterialChapterNode,

  unit: MaterialUnitNode,
) {
  materialEditorContext.value = {
    kind: 'card',

    mode: 'create',

    chapter,

    unit,

    nextOrder: nextOrder(unit.knowledge_cards),
  };

  materialEditorOpen.value = true;
}

function openEditCard(
  chapter: MaterialChapterNode,

  unit: MaterialUnitNode,

  card: MaterialKnowledgeCardNode,
) {
  materialEditorContext.value = {
    kind: 'card',

    mode: 'edit',

    chapter,

    unit,

    card,
  };

  materialEditorOpen.value = true;
}

function requestDeleteChapter(chapter: MaterialChapterNode) {
  Dialog.create({
    title: '刪除章節',

    message: `確定要刪除「${chapter.name}」嗎？`,

    cancel: true,

    persistent: true,

    ok: {
      label: '刪除',

      color: 'negative',
    },
  }).onOk(() => {
    void performDeleteChapter(chapter.id);
  });
}

async function performDeleteChapter(chapterId: number) {
  const success = await deleteChapter(chapterId);

  if (success) {
    notifyMaterialSuccess('章節已刪除');
  }
}

function requestDeleteUnit(unit: MaterialUnitNode) {
  Dialog.create({
    title: '刪除單元',

    message: `確定要刪除「${unit.name}」嗎？`,

    cancel: true,

    persistent: true,

    ok: {
      label: '刪除',

      color: 'negative',
    },
  }).onOk(() => {
    void performDeleteUnit(unit.id);
  });
}

async function performDeleteUnit(unitId: number) {
  const success = await deleteUnit(unitId);

  if (success) {
    notifyMaterialSuccess('單元已刪除');
  }
}

function requestDeleteCard(card: MaterialKnowledgeCardNode) {
  Dialog.create({
    title: '刪除知識卡',

    message: `確定要刪除「${card.title}」嗎？`,

    cancel: true,

    persistent: true,

    ok: {
      label: '刪除',

      color: 'negative',
    },
  }).onOk(() => {
    void performDeleteCard(card.id);
  });
}

async function performDeleteCard(cardId: number) {
  const success = await deleteKnowledgeCard(cardId);

  if (success) {
    notifyMaterialSuccess('知識卡已刪除');
  }
}
</script>
