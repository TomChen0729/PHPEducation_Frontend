<template>
  <section class="course-material-panel">
    <!-- =========================
         Header
    ========================== -->
    <div class="course-material-panel__header">
      <div>
        <h5>教材管理</h5>

        <p>查看、匯入與發布本課程教材</p>
      </div>

      <div class="course-material-panel__header-actions">
        <q-btn
          outline
          color="blue"
          icon="download"
          label="下載範本"
          :loading="downloadingTemplate"
          @click="$emit('download-template')"
        />

        <q-btn unelevated color="blue" icon="add" label="新增教材" @click="openImportDialog" />
      </div>
    </div>

    <!-- =========================
         Loading
    ========================== -->
    <div v-if="loading" class="course-material-panel__loading">
      <q-spinner color="blue" size="40px" />
    </div>

    <!-- =========================
         Empty
    ========================== -->
    <div v-else-if="drafts.length === 0" class="course-material-panel__empty">
      <q-icon name="menu_book" size="48px" color="grey-5" />

      <div>目前尚無教材</div>

      <div class="text-caption text-grey-6">可以下載 Excel 範本後匯入第一份教材</div>
    </div>

    <!-- =========================
         Draft List
    ========================== -->
    <div v-else class="course-material-panel__list">
      <q-card
        v-for="draft in drafts"
        :key="draft.id"
        flat
        bordered
        class="course-material-panel__card"
      >
        <q-card-section>
          <div class="course-material-panel__card-header">
            <div>
              <div class="text-h6">
                {{ draft.name }}
              </div>

              <div class="text-caption text-grey-7">
                {{ draft.topics.length }}
                個主題
              </div>
            </div>

            <q-badge :color="statusColor(draft.status)" :label="statusLabel(draft.status)" />
          </div>

          <div class="course-material-panel__actions">
            <!-- View -->
            <q-btn
              flat
              color="blue"
              icon="visibility"
              label="查看教材"
              @click="$emit('view', draft)"
            />

            <!-- Draft -->
            <q-btn
              v-if="draft.status === 'draft'"
              flat
              color="blue"
              icon="edit"
              label="編輯教材"
              @click="$emit('view', draft)"
            />

            <!-- Publish -->
            <q-btn
              v-if="draft.status === 'draft'"
              unelevated
              color="blue"
              icon="publish"
              label="發布"
              :loading="publishingDraftId === draft.id"
              @click="$emit('publish', draft)"
            />

            <!-- Published -->
            <q-btn
              v-if="draft.status === 'published'"
              outline
              color="blue"
              icon="edit"
              label="建立編輯草稿"
              :loading="creatingDraft"
              @click="$emit('create-draft')"
            />
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- =========================
         Import Dialog
    ========================== -->
    <q-dialog v-model="importDialog" persistent>
      <q-card class="course-material-panel__dialog">
        <q-card-section>
          <div class="text-h6">匯入教材</div>

          <div class="text-caption text-grey-7">請使用系統提供的 Excel 範本</div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <!-- 匯入失敗訊息 -->
          <q-banner v-if="importErrorMessage" rounded class="bg-red-1 text-negative q-mb-md">
            <template #avatar>
              <q-icon name="error_outline" color="negative" />
            </template>

            {{ importErrorMessage }}
          </q-banner>

          <q-file
            v-model="selectedFile"
            outlined
            clearable
            label="選擇 .xlsx 教材檔案"
            accept=".xlsx"
            @update:model-value="handleFileChange"
          >
            <template #prepend>
              <q-icon name="upload_file" />
            </template>
          </q-file>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="取消" :disable="importing" @click="closeImportDialog" />

          <q-btn
            unelevated
            color="blue"
            icon="upload"
            label="匯入"
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
import { ref } from 'vue';

import type { MaterialDraft, MaterialDraftStatus } from '../../../types/material';

defineProps<{
  drafts: MaterialDraft[];

  loading: boolean;

  importing: boolean;

  downloadingTemplate: boolean;

  creatingDraft: boolean;

  publishingDraftId: number | null;

  importErrorMessage: string;
}>();

const emit = defineEmits<{
  'download-template': [];

  import: [file: File];

  'clear-import-error': [];

  view: [draft: MaterialDraft];

  publish: [draft: MaterialDraft];

  'create-draft': [];
}>();

const importDialog = ref(false);

const selectedFile = ref<File | null>(null);

function submitImport() {
  /*
   * 確認真的拿到 File。
   */
  if (!selectedFile.value || !(selectedFile.value instanceof File)) {
    console.error('選擇的教材不是 File：', selectedFile.value);

    return;
  }

  emit('import', selectedFile.value);
}

function openImportDialog() {
  selectedFile.value = null;

  emit('clear-import-error');

  importDialog.value = true;
}

function closeImportDialog() {
  selectedFile.value = null;

  emit('clear-import-error');

  importDialog.value = false;
}

defineExpose({
  closeImportDialog,
});

function handleFileChange() {
  emit('clear-import-error');
}

function statusLabel(status: MaterialDraftStatus) {
  switch (status) {
    case 'draft':
      return '草稿';

    case 'published':
      return '已發布';

    case 'archived':
      return '已封存';
  }
}

function statusColor(status: MaterialDraftStatus) {
  switch (status) {
    case 'draft':
      return 'orange';

    case 'published':
      return 'positive';

    case 'archived':
      return 'grey';
  }
}
</script>
