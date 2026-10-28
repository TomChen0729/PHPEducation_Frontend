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
                {
                  label: '單一單元',
                  value: 'unit',
                  icon: 'filter_1',
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

          <q-banner v-else rounded class="course-material-panel__student-preview-hint q-mb-md">
            這是預覽畫面；實際學生端只會取得已開放（published）的單元。
          </q-banner>

          <div v-if="viewMode === 'unit'" class="row q-col-gutter-md q-mb-md">
            <q-select
              v-model="selectedUnitChapterId"
              class="col-12 col-sm-6"
              outlined
              emit-value
              map-options
              label="選擇章節"
              :options="unitChapterOptions"
            />
            <q-select
              v-model="selectedUnitId"
              class="col-12 col-sm-6"
              outlined
              emit-value
              map-options
              label="選擇單元"
              :options="unitSelectOptions"
              :disable="!selectedUnitChapterId"
              :loading="singleUnitLoading"
            />
          </div>

          <q-banner v-if="singleUnitError" rounded class="bg-red-1 text-negative q-mb-md">
            {{ singleUnitError }}
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
            show-chapter-graph-button
            show-unit-graph-button
            :chapter-graph-action="handleViewChapterGraph"
            :unit-graph-action="handleViewUnitGraph"
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

          <div v-else-if="viewMode === 'unit' && singleUnitLoading" class="course-material-panel__loading">
            <q-spinner color="blue" size="36px" />
          </div>

          <MaterialTreeViewer
            v-else-if="viewMode === 'unit' && singleUnitTree"
            :tree="singleUnitTree"
            :theme="audienceMode === 'student' ? 'student' : 'teacher'"
          />
        </div>
      </div>
    </div>

    <!-- Import Dialog -->
    <q-dialog v-model="importDialog" persistent>
      <q-card class="course-material-panel__import-dialog">
        <q-card-section class="course-material-panel__import-dialog-header">
          <div>
            <div class="text-h6 text-weight-bold">
              {{ hasMaterial ? '匯入教材' : '新增教材' }}
            </div>

            <div class="text-caption text-grey-7">
              先預覽匯入結果，確認影響範圍後再正式寫入教材。
            </div>
          </div>

          <q-btn
            flat
            round
            dense
            icon="close"
            :disable="previewing || importing"
            @click="closeImportDialog"
          />
        </q-card-section>

        <q-separator />

        <q-card-section class="course-material-panel__import-content">
          <q-banner v-if="errorMessage" rounded class="bg-red-1 text-negative">
            {{ errorMessage }}
          </q-banner>

          <div class="course-material-panel__import-step">
            <div class="course-material-panel__import-step-title">
              <span class="course-material-panel__import-step-number">1</span>
              選擇匯入方式
            </div>

            <div v-if="!hasMaterial" class="course-material-panel__first-import">
              <q-icon name="library_add" color="blue" size="28px" />

              <div>
                <div class="text-weight-bold">首次匯入教材</div>
                <div class="text-caption text-grey-7">
                  目前沒有既有教材，本次會直接建立 Excel 中的完整教材。
                </div>
              </div>
            </div>

            <div v-else class="course-material-panel__mode-grid">
              <button
                v-for="option in importModeOptions"
                :key="option.value"
                type="button"
                class="course-material-panel__mode-card"
                :class="{
                  'course-material-panel__mode-card--active': importMode === option.value,
                  'course-material-panel__mode-card--danger': option.value === 'overwrite',
                }"
                :disabled="previewing || importing"
                @click="setImportMode(option.value)"
              >
                <q-icon :name="option.icon" size="30px" />

                <div>
                  <div class="course-material-panel__mode-title">
                    {{ option.label }}
                  </div>

                  <div class="course-material-panel__mode-description">
                    {{ option.description }}
                  </div>
                </div>
              </button>
            </div>

            <q-select
              v-if="hasMaterial && importMode === 'replace'"
              v-model="replaceChapterId"
              outlined
              emit-value
              map-options
              label="要替換的章節 *"
              :options="chapterOptions"
              :disable="previewing || importing"
              @update:model-value="handleReplaceChapterChange"
            />

            <q-banner v-if="importMode === 'replace'" rounded class="bg-blue-1 text-blue-9">
              替換指定章節時，Excel 必須剛好只有一個章節。其他章節不會被修改。
            </q-banner>

            <q-banner
              v-if="importMode === 'overwrite' && hasMaterial"
              rounded
              class="course-material-panel__overwrite-warning"
            >
              <template #avatar>
                <q-icon name="warning_amber" color="orange-8" />
              </template>

              覆蓋匯入會以 Excel 內容取代整門課教材。請務必先查看預覽中的刪除項目與受影響題目。
            </q-banner>
          </div>

          <q-separator />

          <div class="course-material-panel__import-step">
            <div class="course-material-panel__import-step-title">
              <span class="course-material-panel__import-step-number">2</span>
              選擇 Excel
            </div>

            <div class="course-material-panel__import-step-description">
              請使用最新教材範本。附加匯入可以包含多個新章節；替換章節只能包含一個章節。
            </div>

            <div class="course-material-panel__import-file-row">
              <q-file
                :model-value="selectedFile"
                outlined
                clearable
                accept=".xlsx"
                label="選擇 Excel 教材檔案 *"
                :disable="previewing || importing"
                @update:model-value="handleFileChange"
              >
                <template #prepend>
                  <q-icon name="upload_file" />
                </template>
              </q-file>

              <q-btn
                outline
                color="blue"
                icon="download"
                label="下載範本"
                :loading="downloadingTemplate"
                :disable="previewing || importing"
                @click="emit('download-template')"
              />
            </div>
          </div>

          <q-separator />

          <div class="course-material-panel__import-step">
            <div class="course-material-panel__import-step-title">
              <span class="course-material-panel__import-step-number">3</span>
              預覽匯入結果
            </div>

            <div class="course-material-panel__import-step-description">預覽不會修改資料庫。</div>

            <q-btn
              unelevated
              color="blue"
              icon="preview"
              label="預覽匯入"
              :loading="previewing"
              :disable="!canPreview || importing"
              @click="submitPreview"
            />
          </div>

          <template v-if="importPreview">
            <q-separator />

            <div class="course-material-panel__preview">
              <div class="course-material-panel__preview-header">
                <div>
                  <div class="text-h6 text-weight-bold">匯入預覽</div>

                  <div class="text-caption text-grey-7">
                    {{ importModeLabel(importPreview.mode) }}
                  </div>
                </div>

                <q-badge color="positive" outline label="尚未寫入資料庫" />
              </div>

              <div class="course-material-panel__preview-stats">
                <div class="course-material-panel__preview-stat">
                  <strong>{{ importPreview.summary.chapters }}</strong>
                  <span>新增章節</span>
                </div>

                <div class="course-material-panel__preview-stat">
                  <strong>{{ importPreview.summary.units }}</strong>
                  <span>匯入單元</span>
                </div>

                <div class="course-material-panel__preview-stat">
                  <strong>{{ importPreview.summary.new_cards }}</strong>
                  <span>新增知識卡</span>
                </div>

                <div class="course-material-panel__preview-stat">
                  <strong>{{ importPreview.summary.updated_cards }}</strong>
                  <span>更新知識卡</span>
                </div>

                <div class="course-material-panel__preview-stat">
                  <strong>{{ importPreview.summary.reused_cards }}</strong>
                  <span>沿用知識卡</span>
                </div>

                <div class="course-material-panel__preview-stat">
                  <strong>{{ importPreview.summary.deleted_cards }}</strong>
                  <span>刪除知識卡</span>
                </div>
              </div>

              <q-banner
                v-if="importPreview.duplicate_chapter_names.length > 0"
                rounded
                class="bg-orange-1 text-orange-10"
              >
                附加匯入偵測到同名章節：
                {{ importPreview.duplicate_chapter_names.join('、') }}。
                這些章節仍會以新章節方式接在後面。
              </q-banner>

              <q-banner v-if="hasPreviewRemoval" rounded class="bg-red-1 text-negative">
                <div class="text-weight-bold q-mb-xs">此次匯入會移除或解除部分教材關聯</div>

                <div v-if="importPreview.removed.units.length > 0">
                  移除單元：{{ importPreview.removed.units.join('、') }}
                </div>

                <div v-if="importPreview.removed.deleted_cards.length > 0">
                  刪除知識卡：
                  {{ importPreview.removed.deleted_cards.map((card) => card.title).join('、') }}
                </div>

                <div v-if="importPreview.removed.detached_cards.length > 0">
                  解除章節關聯但保留的知識卡：
                  {{ importPreview.removed.detached_cards.map((card) => card.title).join('、') }}
                </div>
              </q-banner>

              <q-banner
                v-if="importPreview.affected_questions.length > 0"
                rounded
                class="bg-amber-1 text-brown-9"
              >
                <div class="text-weight-bold q-mb-xs">
                  {{ importPreview.affected_questions.length }} 題題目會受到知識卡刪除影響
                </div>

                <div
                  v-for="question in importPreview.affected_questions"
                  :key="question.id"
                  class="course-material-panel__affected-question"
                >
                  {{ question.title }}
                  <span v-if="question.remaining_cards === 0"> （匯入後將沒有關聯知識卡） </span>
                </div>
              </q-banner>

              <div class="course-material-panel__preview-tree">
                <div class="text-subtitle1 text-weight-bold q-mb-sm">匯入完成後的教材</div>

                <MaterialTreeViewer :tree="importPreview.course" theme="teacher" />
              </div>
            </div>
          </template>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="course-material-panel__import-actions">
          <q-btn flat label="取消" :disable="previewing || importing" @click="closeImportDialog" />

          <q-btn
            v-if="importPreview"
            unelevated
            :color="importPreview.mode === 'overwrite' ? 'orange-8' : 'blue'"
            icon="check"
            label="確認匯入"
            :loading="importing"
            :disable="previewing"
            @click="submitImport"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

// import { Dialog } from 'quasar';

import MaterialTreeViewer from '../../material/MaterialTreeViewer.vue';

import MaterialGraphViewer from '../../material/MaterialGraphViewer.vue';
import { teacherMaterialApi } from '../../../api/teacher-material.api';
import { studentMaterialApi } from '../../../api/student-material.api';

import type {
  MaterialChapterNode,
  MaterialCourseTree,
  MaterialImportMode,
  MaterialImportPreviewResponse,
  MaterialKnowledgeCardNode,
  MaterialUnitNode,
  MaterialUnitStatus,
} from '../../../types/material';

type MaterialViewMode = 'tree' | 'graph' | 'unit';

type MaterialAudienceMode = 'teacher' | 'student';

const props = withDefaults(
  defineProps<{
    courseTree: MaterialCourseTree | null;

    hasMaterial: boolean;

    chapterCount: number;

    unitCount: number;

    knowledgeCardCount: number;

    loading: boolean;

    previewing: boolean;

    importing: boolean;

    importPreview: MaterialImportPreviewResponse | null;

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

  'preview-import': [file: File, mode: MaterialImportMode, chapterId: number | null];

  import: [file: File, mode: MaterialImportMode, chapterId: number | null, fingerprint: string];

  'clear-import-preview': [];

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
const graphChapterId = ref<number | null>(null);
const graphUnitId = ref<number | null>(null);

const audienceMode = ref<MaterialAudienceMode>('teacher');
const selectedUnitChapterId = ref<number | null>(null);
const selectedUnitId = ref<number | null>(null);
const singleUnitLoading = ref(false);
const singleUnitError = ref('');
const singleUnitTree = ref<MaterialCourseTree | null>(null);
/*
 * 可選擇章節及單元，並依教師檢視或學生預覽呼叫對應的單元圖譜
 * 查詢結果只以選取單元的資料呈現
*/
const unitChapterOptions = computed(() => (props.courseTree?.chapters ?? [])
  .map((chapter) => ({ label: chapter.name, value: chapter.id })));
const unitSelectOptions = computed(() => {
  const chapter = props.courseTree?.chapters.find((item) => item.id === selectedUnitChapterId.value);
  return (chapter?.units ?? [])
    .filter((unit) => audienceMode.value === 'teacher' || unit.status !== 'draft')
    .map((unit) => ({ label: unit.name, value: unit.id }));
});

watch(selectedUnitChapterId, () => {
  selectedUnitId.value = null;
  singleUnitTree.value = null;
});

watch(viewMode, (mode) => {
  if (mode !== 'graph') {
    graphChapterId.value = null;
    graphUnitId.value = null;
  }
});

watch([selectedUnitId, audienceMode], async ([unitId, audience]) => {
  singleUnitTree.value = null;
  singleUnitError.value = '';
  if (!unitId || viewMode.value !== 'unit') return;
  singleUnitLoading.value = true;
  try {
    const unit = audience === 'teacher'
      ? (await teacherMaterialApi.getUnitGraph(unitId)).data.unit
      : (await studentMaterialApi.getUnitGraph(unitId)).data.unit;
      // 將查詢回來的單元包成既有教材檢視元件可顯示的結構
    const chapter = props.courseTree?.chapters.find((item) => item.id === selectedUnitChapterId.value);
    singleUnitTree.value = {
      id: props.courseTree?.id ?? 0,
      name: props.courseTree?.name ?? '課程教材',
      chapters: [{ id: selectedUnitChapterId.value ?? 0, name: chapter?.name ?? '', title: chapter?.name ?? '', sort_order: 0, units: [unit] }],
    };
  } catch {
    singleUnitError.value = '單元教材載入失敗，請重新選擇或稍後再試。';
  } finally {
    singleUnitLoading.value = false;
  }
});

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
  const tree = audienceMode.value === 'student' ? studentPreviewTree.value : props.courseTree;

  if (
    !tree ||
    viewMode.value !== 'graph' ||
    (graphChapterId.value === null && graphUnitId.value === null)
  ) {
    return tree;
  }

  const scopedChapters = tree.chapters
    .filter((chapter) => graphChapterId.value === null || chapter.id === graphChapterId.value)
    .map((chapter) => ({
      ...chapter,
      units:
        graphUnitId.value === null
          ? chapter.units
          : chapter.units.filter((unit) => unit.id === graphUnitId.value),
    }));

  return {
    ...tree,
    chapters:
      graphUnitId.value === null
        ? scopedChapters
        : scopedChapters.filter((chapter) => chapter.units.length > 0),
  };
});

function handleViewChapterGraph(chapter: MaterialChapterNode) {
  graphChapterId.value = chapter.id;
  graphUnitId.value = null;
  viewMode.value = 'graph';
}

function handleViewUnitGraph(unit: MaterialUnitNode) {
  graphChapterId.value = null;
  graphUnitId.value = unit.id;
  viewMode.value = 'graph';
}

const publishedUnitCount = computed(() => {
  return (
    props.courseTree?.chapters.reduce((total, chapter) => {
      return total + chapter.units.filter((unit) => unit.status !== 'draft').length;
    }, 0) ?? 0
  );
});

const importDialog = ref(false);

const selectedFile = ref<File | null>(null);

const importMode = ref<MaterialImportMode>('overwrite');

const replaceChapterId = ref<number | null>(null);

const importModeOptions: Array<{
  value: MaterialImportMode;
  label: string;
  description: string;
  icon: string;
}> = [
  {
    value: 'append',
    label: '附加匯入',
    description: 'Excel 內的章節接在目前教材最後面，不修改既有章節。',
    icon: 'playlist_add',
  },
  {
    value: 'replace',
    label: '替換指定章節',
    description: '只替換指定的一章，其他章節維持不變。',
    icon: 'find_replace',
  },
  {
    value: 'overwrite',
    label: '覆蓋匯入',
    description: '整門課教材改成這份 Excel 的內容。',
    icon: 'sync',
  },
];

const chapterOptions = computed(() => {
  return (props.courseTree?.chapters ?? [])
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((chapter) => ({
      label: `${chapter.sort_order}｜${chapter.name}`,
      value: chapter.id,
    }));
});

const canPreview = computed(() => {
  if (!selectedFile.value) {
    return false;
  }

  if (props.hasMaterial && importMode.value === 'replace') {
    return replaceChapterId.value !== null;
  }

  return true;
});

const hasPreviewRemoval = computed(() => {
  const preview = props.importPreview;

  if (!preview) {
    return false;
  }

  return (
    preview.removed.units.length > 0 ||
    preview.removed.deleted_cards.length > 0 ||
    preview.removed.detached_cards.length > 0
  );
});

function openImportDialog() {
  selectedFile.value = null;
  importMode.value = props.hasMaterial ? 'append' : 'overwrite';
  replaceChapterId.value = null;

  emit('clear-error');
  emit('clear-import-preview');

  importDialog.value = true;
}

function setImportMode(mode: MaterialImportMode) {
  importMode.value = mode;

  if (mode !== 'replace') {
    replaceChapterId.value = null;
  }

  invalidateImportPreview();
}

function handleReplaceChapterChange(value: number | null) {
  replaceChapterId.value = value;
  invalidateImportPreview();
}

function handleFileChange(value: File | null) {
  selectedFile.value = value;
  invalidateImportPreview();
}

function invalidateImportPreview() {
  emit('clear-error');
  emit('clear-import-preview');
}

function submitPreview() {
  const file = selectedFile.value;

  if (!file || !canPreview.value) {
    return;
  }

  emit(
    'preview-import',
    file,
    importMode.value,
    importMode.value === 'replace' ? replaceChapterId.value : null,
  );
}

function submitImport() {
  const file = selectedFile.value;
  const preview = props.importPreview;

  if (!file || !preview) {
    return;
  }

  emit(
    'import',
    file,
    preview.mode,
    preview.mode === 'replace' ? replaceChapterId.value : null,
    preview.fingerprint,
  );
}

function importModeLabel(mode: MaterialImportMode) {
  const labels: Record<MaterialImportMode, string> = {
    append: '附加匯入',
    replace: '替換指定章節',
    overwrite: '覆蓋匯入',
  };

  return labels[mode];
}

function closeImportDialog() {
  if (props.previewing || props.importing) {
    return;
  }

  selectedFile.value = null;
  replaceChapterId.value = null;

  emit('clear-error');
  emit('clear-import-preview');

  importDialog.value = false;
}

defineExpose({
  closeImportDialog,
});
</script>
