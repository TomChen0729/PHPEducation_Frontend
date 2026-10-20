<template>
  <div class="student-coding-answer">
    <!-- 提示橫幅 (符合組員 Teal 學生色系) -->
    <q-banner rounded class="student-coding-answer__notice q-mb-md">
      <template #avatar>
        <q-icon name="code" color="teal-8" size="26px" />
      </template>
      <div class="student-coding-answer__notice-title">請在下方完成程式實作並進行自測</div>
      <div class="student-coding-answer__notice-text">
        你可以在 STDIN 輸入自訂測資點擊「自測執行」驗證輸出；確認無誤後點擊「送出作答」交由老師進行認知等級診斷。
      </div>
    </q-banner>

    <!-- 1. 程式碼編輯區 -->
    <div class="student-coding-answer__editor-card q-mb-md">
      <div class="student-coding-answer__editor-header">
        <div class="flex items-center q-gutter-x-sm">
          <q-icon name="terminal" color="teal-8" size="20px" />
          <span class="text-weight-bold text-subtitle2 text-teal-10">PHP 程式碼編輯區</span>
        </div>
        <div class="flex items-center q-gutter-x-xs">
          <span class="student-coding-answer__editor-badge">PHP 8.2</span>
          <span class="student-coding-answer__editor-badge">{{ selectedFile?.name ?? 'solution.php' }}</span>
        </div>
      </div>

      <div class="student-coding-answer__editor-body">
        <CodeEditor
          v-if="showCodeEditor"
          v-model="code"
          theme="student"
          :disabled="disabled || loading"
        />
        <div v-else class="student-coding-answer__uploaded-file">
          <q-icon name="description" color="teal-8" size="22px" />
          <div class="student-coding-answer__uploaded-file-info">
            <div class="text-weight-medium">{{ selectedFile?.name }}</div>
            <div class="text-caption text-grey-7">
              PHP 檔案已載入，可直接送出或自測執行。
            </div>
          </div>
          <q-btn
            flat
            dense
            no-caps
            color="teal-8"
            label="檢視／編輯程式碼"
            :disable="disabled || loading"
            @click="showCodeEditor = true"
          />
        </div>
      </div>

      <!-- 錯誤驗證提示 -->
      <div v-if="validationMessage" class="student-coding-answer__error q-mt-sm">
        <q-icon name="error_outline" />
        {{ validationMessage }}
      </div>

      <!-- 2. STDIN 與操作按鈕列 (優化高度與對齊) -->
      <div class="student-coding-answer__toolbar q-mt-md">
        <input
          ref="fileInput"
          class="student-coding-answer__file-input"
          type="file"
          accept=".php"
          @change="handleFileChange"
        />
        <!-- STDIN 自訂測資輸入框 -->
        <div class="student-coding-answer__stdin-wrapper">
          <span class="student-coding-answer__stdin-label">STDIN:</span>
          <input
            v-model="customInput"
            type="text"
            placeholder="輸入測資 (選填，例如: 3, 5, 2, 8, 1)"
            class="student-coding-answer__stdin-input"
            :disabled="executing || loading || disabled"
            @keyup.enter="handleExecute"
          />
        </div>

        <div class="student-coding-answer__actions">
          <q-btn
            outline
            color="teal-8"
            icon="upload_file"
            label="上傳 PHP 檔案"
            no-caps
            class="student-coding-answer__btn"
            :disable="disabled || loading || executing"
            @click="openFilePicker"
          />

          <!-- 自測執行按鈕 -->
          <q-btn
            outline
            color="teal-8"
            icon="play_arrow"
            label="自測執行"
            no-caps
            class="student-coding-answer__btn"
            :loading="executing"
            :disable="disabled || loading"
            @click="handleExecute"
          >
            <template #loading>
              <q-spinner-dots color="teal-8" />
            </template>
          </q-btn>

          <!-- 送出作答按鈕 -->
          <q-btn
            unelevated
            color="teal-8"
            icon="send"
            label="送出作答"
            no-caps
            class="student-coding-answer__btn"
            :loading="loading"
            :disable="disabled || executing"
            @click="handleSubmit"
          >
            <template #loading>
              <q-spinner-dots />
            </template>
          </q-btn>
        </div>
      </div>
    </div>

    <!-- 3. 執行輸出終端卡片 (Console - 背景黑、文字改為清晰白字) -->
    <div class="student-coding-answer__console-card q-mb-md">
      <div class="student-coding-answer__console-header">
        <div class="flex items-center q-gutter-x-xs">
          <q-icon name="dvr" color="teal-8" size="18px" />
          <span class="text-weight-bold text-caption text-grey-9">執行輸出 (Console)</span>
        </div>
        <span class="student-coding-answer__console-stats" :class="execStatusClass">
          {{ execStatsText }}
        </span>
      </div>

      <div class="student-coding-answer__console-body">
        <!-- 執行中狀態 -->
        <div v-if="executing" class="text-teal-3 flex items-center q-gutter-x-sm">
          <q-spinner size="14px" color="teal-3" />
          <span>⚙️ 正在隔離環境編譯執行中...</span>
        </div>

        <!-- 尚未執行 -->
        <div v-else-if="!executeResult" class="text-grey-5">點擊「自測執行」預覽標準輸出...</div>

        <!-- 超時 -->
        <div v-else-if="executeResult.timeout" class="text-amber-3 text-weight-bold">
          {{ executeResult.error || '程式執行超時 (超過時間上限)' }}
        </div>

        <!-- 錯誤 -->
        <div v-else-if="!executeResult.success" class="text-red-3 text-weight-bold">
          {{ executeResult.error || '執行錯誤' }}
        </div>

        <!-- 成功輸出：純白色文字顯示 -->
        <div v-else class="text-white student-coding-answer__console-text">
          {{ executeResult.output !== '' ? executeResult.output : '(無任何標準輸出 STDOUT)' }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import CodeEditor from '../../common/CodeEditor.vue';
import { codingApi } from '../../../api/coding.api';
import type { CodingExecuteResult } from '../../../types/coding';

const props = withDefaults(
  defineProps<{
    starterCode?: string | null;
    questionId?: number | string;
    loading?: boolean;
    disabled?: boolean;
  }>(),
  {
    starterCode: '',
    questionId: 1,
    loading: false,
    disabled: false,
  },
);

const emit = defineEmits<{
  submit: [answer: string | File];
}>();

// 程式碼與輸入值
const code = ref('');
const customInput = ref('3, 5, 2, 8, 1'); // 預設測資
const validationMessage = ref('');
const fileInput = ref<HTMLInputElement | null>(null);
const selectedFile = ref<File | null>(null);
const showCodeEditor = ref(true);

const MAX_UPLOAD_SIZE = 2 * 1024 * 1024;

// 自測狀態
const executing = ref(false);
const executeResult = ref<CodingExecuteResult | null>(null);

// 監聽初始題目程式碼
watch(
  () => props.starterCode,
  (value) => {
    code.value = value ?? '';
    validationMessage.value = '';
    selectedFile.value = null;
    showCodeEditor.value = true;
  },
  { immediate: true },
);

function openFilePicker() {
  if (props.disabled || props.loading || executing.value) return;
  fileInput.value?.click();
}

async function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = '';

  if (!file) return;
  selectedFile.value = null;
  showCodeEditor.value = true;
  if (!file.name.toLowerCase().endsWith('.php')) {
    validationMessage.value = '請選擇 .php 檔案';
    return;
  }
  if (file.size > MAX_UPLOAD_SIZE) {
    validationMessage.value = '檔案不可大於 2 MB';
    return;
  }

  try {
    const content = await file.text();
    if (!content.trim()) {
      validationMessage.value = '上傳的 PHP 檔案不可為空';
      return;
    }

    code.value = content;
    selectedFile.value = file;
    showCodeEditor.value = false;
    validationMessage.value = '';
    executeResult.value = null;
  } catch {
    validationMessage.value = '無法讀取檔案內容，請重新選擇';
  }
}

// ========================================================
// 1. 自測執行功能 (POST /api/coding-execute)
// ========================================================
async function handleExecute() {
  if (executing.value || props.loading) return;

  if (!code.value.trim()) {
    validationMessage.value = '請先撰寫程式碼再進行測試';
    return;
  }
  validationMessage.value = '';

  executing.value = true;
  executeResult.value = null;
  const startTime = performance.now();

  try {
    const res = await codingApi.executeCode({
      code: code.value,
      input: customInput.value,
    });

    const duration = Math.round(performance.now() - startTime);
    executeResult.value = {
      ...res.data,
      duration,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : '連線失敗';
    executeResult.value = {
      success: false,
      output: '',
      error: `測試執行失敗: ${errorMsg}`,
      duration: Math.round(performance.now() - startTime),
    };
  } finally {
    executing.value = false;
  }
}

// ========================================================
// 2. 送出作答 (交由父層發送 POST /api/v1/student/questions/{id}/submit 入庫)
// ========================================================
function handleSubmit() {
  if (props.disabled || props.loading || executing.value) return;

  if (!code.value.trim()) {
    validationMessage.value = '請先完成程式碼再送出';
    return;
  }
  validationMessage.value = '';

  if (selectedFile.value) {
    const editedFile = new File([code.value], selectedFile.value.name, {
      type: selectedFile.value.type || 'application/x-httpd-php',
    });
    emit('submit', editedFile);
  } else {
    emit('submit', code.value);
  }
}

// ========================================================
// UI 輔助 Computed
// ========================================================
const execStatsText = computed(() => {
  if (executing.value) return '執行中...';
  if (!executeResult.value) return '尚未執行';
  const duration = `${executeResult.value.duration ?? 0}ms`;
  if (executeResult.value.timeout) return `Timeout (${duration})`;
  if (!executeResult.value.success)
    return `Exit: ${executeResult.value.exitCode ?? 1} (${duration})`;
  return `成功 (${duration})`;
});

const execStatusClass = computed(() => {
  if (!executeResult.value) return 'text-grey-6';
  if (executeResult.value.timeout) return 'text-amber-8 text-weight-bold';
  if (!executeResult.value.success) return 'text-negative text-weight-bold';
  return 'text-teal-8 text-weight-bold';
});
</script>

<style scoped lang="scss">
.student-coding-answer {
  width: 100%;

  // 提示橫幅 (符合組員 Teal 學生主題)
  &__notice {
    color: #004d40;
    background-color: #e0f2f1;
    border: 1px solid #80cbc4;
  }
  &__notice-title {
    font-size: 14px;
    font-weight: 700;
  }
  &__notice-text {
    margin-top: 2px;
    color: #00695c;
    font-size: 13px;
    line-height: 1.5;
  }

  // 1. 編輯區卡片
  &__editor-card {
    background: #ffffff;
    border: 1px solid #b2dfdb;
    border-radius: 12px;
    padding: 14px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  }
  &__editor-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 8px;
    border-bottom: 1px solid #e0f2f1;
    margin-bottom: 10px;
  }
  &__file-input {
    display: none;
  }
  &__uploaded-file {
    display: flex;
    align-items: center;
    gap: 12px;
    min-height: 100px;
    padding: 16px;
    border: 1px dashed #80cbc4;
    border-radius: 8px;
    background: #f0fdfa;
  }
  &__uploaded-file-info {
    flex: 1;
    min-width: 0;
    overflow-wrap: anywhere;
  }
  &__editor-badge {
    font-family: monospace;
    font-size: 11px;
    font-weight: 600;
    color: #00796b;
    background: #e0f2f1;
    border: 1px solid #b2dfdb;
    padding: 2px 8px;
    border-radius: 4px;
  }

  &__error {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #c62828;
    font-size: 13px;
  }

  // 2. 工具列 (STDIN 與按鈕 - 現代化扁平對齊)
  &__toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
    padding-top: 10px;
    border-top: 1px solid #f1f5f9;
  }
  &__stdin-wrapper {
    flex: 1;
    min-width: 220px;
    height: 38px;
    display: flex;
    align-items: center;
    gap: 8px;
    background: #f8fafc;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    padding: 0 12px;
    transition: all 0.2s ease;

    &:focus-within {
      border-color: #00897b;
      background: #ffffff;
      box-shadow: 0 0 0 2px rgba(0, 137, 123, 0.12);
    }
  }
  &__stdin-label {
    font-size: 12px;
    font-weight: 700;
    color: #475569;
  }
  &__stdin-input {
    width: 100%;
    border: none;
    outline: none;
    background: transparent;
    font-size: 13px;
    font-family: 'Fira Code', Consolas, Monaco, monospace;
    color: #1e293b;
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  &__btn {
    height: 38px;
    font-size: 13px;
    font-weight: 600;
    border-radius: 8px;
    padding: 0 16px;
  }

  // 3. 終端機卡片 (Console)
  &__console-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 12px 14px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  }
  &__console-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 6px;
    border-bottom: 1px solid #f1f5f9;
  }
  &__console-body {
    margin-top: 8px;
    background: #0f172a; // 深黑底色
    border-radius: 8px;
    padding: 12px 14px;
    min-height: 95px;
    max-height: 200px;
    overflow-y: auto;
    font-family: 'Fira Code', Consolas, Monaco, monospace;
    font-size: 13px;
    line-height: 1.6;
    user-select: text;

    &::-webkit-scrollbar {
      width: 5px;
    }
    &::-webkit-scrollbar-thumb {
      background: #334155;
      border-radius: 4px;
    }
  }
  &__console-text {
    white-space: pre-wrap;
    color: #f8fafc; // 純白字清晰輸出
  }
}
</style>
