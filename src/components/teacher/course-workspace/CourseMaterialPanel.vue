<template>
  <section class="course-material-panel">
    <!-- Header -->
    <div class="course-material-panel__header">
      <div>
        <h5 class="text-weight-bold">教材管理</h5>
      </div>

      <div class="course-material-panel__header-actions">
        <q-btn
          outline
          color="blue"
          icon="download"
          label="下載範本"
          :loading="downloadingTemplate"
          :disable="importing"
          @click="emit('download-template')"
        />

        <q-btn
          unelevated
          color="blue"
          :icon="hasMaterial ? 'upload_file' : 'add'"
          :label="hasMaterial ? '重新匯入教材' : '新增教材'"
          :disable="loading"
          @click="openImportDialog"
        />
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="course-material-panel__loading">
      <q-spinner color="blue" size="40px" />
    </div>

    <!-- Empty -->
    <div v-else-if="!hasMaterial" class="course-material-panel__empty">
      <q-icon name="menu_book" size="52px" color="grey-5" />

      <div class="text-subtitle1 text-weight-medium">目前尚無教材</div>

      <div class="text-caption text-grey-6">下載 Excel 範本並匯入第一份教材</div>

      <q-btn
        unelevated
        color="blue"
        icon="add"
        label="新增教材"
        class="q-mt-sm"
        @click="openImportDialog"
      />
    </div>

    <!-- Material -->
    <div v-else class="course-material-panel__content">
      <!-- Summary -->
      <q-card flat class="course-material-panel__summary">
        <q-card-section>
          <div class="course-material-panel__stats">
            <div class="course-material-panel__stat">
              <div class="course-material-panel__stat-value">
                {{ chapterCount }}
              </div>

              <div class="course-material-panel__stat-label">章節</div>
            </div>

            <div class="course-material-panel__stat">
              <div class="course-material-panel__stat-value">
                {{ unitCount }}
              </div>

              <div class="course-material-panel__stat-label">單元</div>
            </div>

            <div class="course-material-panel__stat">
              <div class="course-material-panel__stat-value">
                {{ knowledgeCardCount }}
              </div>

              <div class="course-material-panel__stat-label">知識卡</div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Viewer -->
      <div class="course-material-panel__viewer">
        <div class="course-material-panel__viewer-header">
          <div>
            <div class="course-material-panel__viewer-title">教材內容</div>

            <div class="course-material-panel__viewer-caption">
              可切換老師／學生預覽，以及階層／圖譜檢視
            </div>
          </div>

          <div class="course-material-panel__viewer-actions">
            <q-btn-toggle
              v-model="audienceMode"
              unelevated
              no-caps
              color="grey-2"
              text-color="blue-grey-8"
              toggle-color="blue-grey-7"
              toggle-text-color="white"
              :options="[
                {
                  label: '老師檢視',
                  value: 'teacher',
                },
                {
                  label: '學生檢視（預覽）',
                  value: 'student',
                },
              ]"
            />

            <q-btn-toggle
              v-model="viewMode"
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
          </div>
        </div>

        <q-separator />

        <div class="course-material-panel__viewer-content">
          <q-banner
            v-if="audienceMode === 'teacher'"
            rounded
            class="course-material-panel__teacher-hint q-mb-md"
          >
            草稿單元只有老師看得到；切成「開放給學生」後，學生才會在課程教材中看到。
          </q-banner>

          <q-banner
            v-else
            rounded
            class="course-material-panel__student-preview-hint q-mb-md"
          >
            這是預覽畫面；實際學生端只會取得已開放（published）的單元。
          </q-banner>

          <div
            v-if="audienceMode === 'student' && publishedUnitCount === 0"
            class="course-material-panel__preview-empty"
          >
            <q-icon name="visibility_off" size="42px" color="grey-5" />

            <div>目前沒有已開放給學生的單元</div>
          </div>

          <MaterialTreeViewer
            v-else-if="viewMode === 'tree' && displayTree"
            :tree="displayTree"
            :theme="audienceMode === 'student' ? 'student' : 'teacher'"
            :editable="audienceMode === 'teacher'"
            :actions-disabled="editing"
            @create-chapter="emit('create-chapter')"
            @edit-chapter="(chapter) => emit('edit-chapter', chapter)"
            @delete-chapter="(chapter) => emit('delete-chapter', chapter)"
            @create-unit="(chapter) => emit('create-unit', chapter)"
            @edit-unit="(chapter, unit) => emit('edit-unit', chapter, unit)"
            @delete-unit="(unit) => emit('delete-unit', unit)"
            @update-unit-status="(unit, status) => emit('update-unit-status', unit, status)"
            @create-card="(chapter, unit) => emit('create-card', chapter, unit)"
            @edit-card="(chapter, unit, card) => emit('edit-card', chapter, unit, card)"
            @delete-card="(card) => emit('delete-card', card)"
          />

          <MaterialGraphViewer
            v-else-if="viewMode === 'graph' && displayTree"
            :tree="displayTree"
            :theme="audienceMode === 'student' ? 'student' : 'teacher'"
            :show-full-view-button="false"
            @edit-chapter="(chapter) => emit('edit-chapter', chapter)"
            @edit-unit="(chapter, unit) => emit('edit-unit', chapter, unit)"
            @edit-card="(chapter, unit, card) => emit('edit-card', chapter, unit, card)"
          />
        </div>
      </div>
    </div>

    <!-- Import Dialog -->
    <q-dialog v-model="importDialog" persistent>
      <q-card class="course-material-panel__import-dialog">
        <q-card-section>
          <div class="text-h6 text-weight-bold">
            {{ hasMaterial ? '重新匯入教材' : '新增教材' }}
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section class="course-material-panel__import-content">
          <q-banner v-if="errorMessage" rounded class="bg-red-1 text-negative">
            {{ errorMessage }}
          </q-banner>

          <div class="course-material-panel__import-step">
            <div class="course-material-panel__import-step-title">
              <span class="course-material-panel__import-step-number"> 1 </span>

              下載 Excel 範本
            </div>

            <div class="course-material-panel__import-step-description">
              請使用最新教材範本填寫教材內容。
            </div>

            <q-btn
              outline
              color="blue"
              icon="download"
              label="下載教材範本"
              :loading="downloadingTemplate"
              :disable="importing"
              @click="emit('download-template')"
            />
          </div>

          <q-separator />

          <div class="course-material-panel__import-step">
            <div class="course-material-panel__import-step-title">
              <span class="course-material-panel__import-step-number"> 2 </span>

              填寫教材內容
            </div>

            <div class="course-material-panel__import-hint">
              <div class="text-weight-medium q-mb-sm">Excel 欄位</div>

              <div class="course-material-panel__import-fields">
                <q-chip dense color="blue-1" text-color="blue-9" label="章節名稱" />

                <q-chip dense color="blue-1" text-color="blue-9" label="章節順序" />

                <q-chip dense color="blue-1" text-color="blue-9" label="單元名稱" />

                <q-chip dense color="blue-1" text-color="blue-9" label="單元順序" />

                <q-chip dense color="blue-1" text-color="blue-9" label="知識卡名稱" />

                <q-chip dense color="blue-1" text-color="blue-9" label="類別" />

                <q-chip dense color="blue-1" text-color="blue-9" label="教材內容" />

                <q-chip dense color="blue-1" text-color="blue-9" label="程式範例" />
              </div>
            </div>
          </div>

          <q-separator />

          <div class="course-material-panel__import-step">
            <div class="course-material-panel__import-step-title">
              <span class="course-material-panel__import-step-number"> 3 </span>

              上傳 Excel
            </div>

            <q-file
              v-model="selectedFile"
              outlined
              clearable
              accept=".xlsx"
              label="選擇 Excel 教材檔案 *"
              :disable="importing"
              @update:model-value="emit('clear-error')"
            >
              <template #prepend>
                <q-icon name="upload_file" />
              </template>
            </q-file>
          </div>

          <q-banner v-if="hasMaterial" rounded class="course-material-panel__overwrite-warning">
            <template #avatar>
              <q-icon name="warning_amber" color="orange-8" />
            </template>

            此課程已有教材。重新匯入後，將以新的 Excel 更新目前教材內容。
          </q-banner>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="course-material-panel__import-actions">
          <q-btn flat label="取消" :disable="importing" @click="closeImportDialog" />

          <q-btn
            unelevated
            color="blue"
            icon="upload"
            :label="hasMaterial ? '重新匯入' : '匯入教材'"
            :loading="importing"
            :disable="selectedFile === null"
            @click="submitImport"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

import { Dialog } from 'quasar';

import MaterialTreeViewer from '../../material/MaterialTreeViewer.vue';

import MaterialGraphViewer from '../../material/MaterialGraphViewer.vue';

import type {
  MaterialChapterNode,
  MaterialCourseTree,
  MaterialKnowledgeCardNode,
  MaterialUnitNode,
  MaterialUnitStatus,
} from '../../../types/material';

type MaterialViewMode = 'tree' | 'graph';

type MaterialAudienceMode = 'teacher' | 'student';

const props = withDefaults(
  defineProps<{
    courseTree: MaterialCourseTree | null;

    hasMaterial: boolean;

    chapterCount: number;

    unitCount: number;

    knowledgeCardCount: number;

    loading: boolean;

    importing: boolean;

    downloadingTemplate: boolean;

    editing: boolean;

    errorMessage?: string;
  }>(),
  {
    errorMessage: '',
  },
);

const emit = defineEmits<{
  'download-template': [];

  import: [file: File, overwrite: boolean];

  edit: [];

  'clear-error': [];

  'create-chapter': [];

  'edit-chapter': [chapter: MaterialChapterNode];

  'delete-chapter': [chapter: MaterialChapterNode];

  'create-unit': [chapter: MaterialChapterNode];

  'edit-unit': [chapter: MaterialChapterNode, unit: MaterialUnitNode];

  'delete-unit': [unit: MaterialUnitNode];

  'update-unit-status': [unit: MaterialUnitNode, status: MaterialUnitStatus];

  'create-card': [chapter: MaterialChapterNode, unit: MaterialUnitNode];

  'edit-card': [
    chapter: MaterialChapterNode,

    unit: MaterialUnitNode,

    card: MaterialKnowledgeCardNode,
  ];

  'delete-card': [card: MaterialKnowledgeCardNode];
}>();

const viewMode = ref<MaterialViewMode>('tree');

const audienceMode = ref<MaterialAudienceMode>('teacher');

const studentPreviewTree = computed<MaterialCourseTree | null>(() => {
  if (!props.courseTree) {
    return null;
  }

  return {
    ...props.courseTree,
    chapters: props.courseTree.chapters
      .map((chapter) => ({
        ...chapter,
        units: chapter.units.filter((unit) => unit.status !== 'draft'),
      }))
      .filter((chapter) => chapter.units.length > 0),
  };
});

const displayTree = computed(() => {
  return audienceMode.value === 'student' ? studentPreviewTree.value : props.courseTree;
});

const publishedUnitCount = computed(() => {
  return (
    props.courseTree?.chapters.reduce((total, chapter) => {
      return total + chapter.units.filter((unit) => unit.status !== 'draft').length;
    }, 0) ?? 0
  );
});

const importDialog = ref(false);

const selectedFile = ref<File | null>(null);

function openImportDialog() {
  selectedFile.value = null;

  emit('clear-error');

  importDialog.value = true;
}

function submitImport() {
  const file = selectedFile.value;

  if (!file) {
    return;
  }

  if (!props.hasMaterial) {
    emit('import', file, false);

    return;
  }

  Dialog.create({
    title: '確認重新匯入',

    message: '重新匯入會以新的 Excel 更新目前教材。確定要繼續嗎？',

    cancel: {
      label: '取消',

      flat: true,
    },

    ok: {
      label: '確認重新匯入',

      color: 'blue',
    },

    persistent: true,
  }).onOk(() => {
    emit('import', file, true);
  });
}

function closeImportDialog() {
  if (props.importing) {
    return;
  }

  selectedFile.value = null;

  emit('clear-error');

  importDialog.value = false;
}

defineExpose({
  closeImportDialog,
});
</script>
