<template>
  <section class="course-material-panel">
    <!-- Header -->
    <div class="course-material-panel__header">
      <div>
        <h5 class="text-weight-bold">教材管理</h5>

        <p>管理本課程的正式教材，儲存後學生將立即看到最新內容</p>
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
      <q-card flat bordered class="course-material-panel__material-card">
        <q-card-section>
          <div class="course-material-panel__material-card-main">
            <div class="course-material-panel__material-icon">
              <q-icon name="menu_book" size="30px" />
            </div>

            <div class="course-material-panel__material-info">
              <div class="course-material-panel__material-name">
                {{ courseName }}
              </div>

              <div class="course-material-panel__material-caption">
                正式教材 ・ 儲存修改後學生將立即看到最新內容
              </div>
            </div>

            <q-badge color="positive" label="使用中" />
          </div>

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

          <q-separator class="q-my-md" />

          <div class="course-material-panel__actions">
            <q-btn flat color="blue" icon="visibility" label="查看教材" @click="emit('view')" />

            <q-btn flat color="blue" icon="edit" label="編輯教材" @click="emit('edit')" />

            <q-btn
              flat
              color="blue"
              icon="upload_file"
              label="重新匯入"
              @click="openImportDialog"
            />
          </div>
        </q-card-section>
      </q-card>
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

          <!-- Step 1 -->
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

          <!-- Step 2 -->
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

          <!-- Step 3 -->
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
import { ref } from 'vue';

import { Dialog } from 'quasar';

const props = withDefaults(
  defineProps<{
    courseName: string;
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

  view: [];

  edit: [];

  'clear-error': [];
}>();

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
