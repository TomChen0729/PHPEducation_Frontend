<template>
  <div class="student-debug-answer">
    <!-- =====================================================
         Empty State
    ====================================================== -->
    <div
      v-if="normalizedErrorCount === 0"
      class="student-debug-answer__empty"
    >
      <q-icon name="error_outline" size="32px" color="grey-5" />

      <div>此題目前沒有可作答的除錯欄位</div>
    </div>

    <!-- =====================================================
         Debug Form
    ====================================================== -->
    <q-form
      v-else
      ref="formRef"
      class="student-debug-answer__form"
      @submit="handleSubmit"
    >
      <q-banner
        rounded
        class="student-debug-answer__notice"
      >
        <template #avatar>
          <q-icon name="bug_report" color="deep-orange-7" />
        </template>

        <div class="student-debug-answer__notice-title">
          此題共有 {{ normalizedErrorCount }} 個錯誤
        </div>

        <div class="student-debug-answer__notice-text">
          請自行判斷錯誤行號，並填入修正後的程式碼。系統不會提示錯誤所在行。
        </div>
      </q-banner>

      <div class="student-debug-answer__fields">
        <div
          v-for="(item, index) in answerRows"
          :key="index"
          class="student-debug-answer__field"
        >
          <div class="student-debug-answer__field-header">
            <div class="student-debug-answer__field-title">
              <q-icon name="build" size="18px" />

              錯誤 {{ index + 1 }}
            </div>
          </div>

          <div class="student-debug-answer__field-grid">
            <q-input
              v-model.number="item.lineNumber"
              outlined
              type="number"
              min="1"
              label="錯誤行號 *"
              hint="請輸入你判斷有錯的程式行號"
              :disable="disabled || loading"
              :rules="[
                positiveIntegerRule,
                (value) => uniqueLineNumberRule(value, index),
              ]"
              lazy-rules="ondemand"
              @update:model-value="resetBackendError"
            >
              <template #prepend>
                <q-icon name="format_list_numbered" />
              </template>
            </q-input>

            <q-input
              v-model="item.answer"
              outlined
              type="textarea"
              autogrow
              label="修正後程式碼 *"
              hint="請輸入這一行修正後的完整程式碼"
              :disable="disabled || loading"
              :rules="[requiredAnswerRule]"
              lazy-rules="ondemand"
              @update:model-value="resetBackendError"
            >
              <template #prepend>
                <q-icon name="code" />
              </template>
            </q-input>
          </div>
        </div>
      </div>

      <div
        v-if="localErrorMessage"
        class="student-debug-answer__error"
      >
        <q-icon name="error_outline" />

        {{ localErrorMessage }}
      </div>

      <div class="student-debug-answer__actions">
        <q-btn
          type="submit"
          unelevated
          no-caps
          color="deep-orange-7"
          icon="send"
          label="送出答案"
          :loading="loading"
          :disable="disabled"
        />
      </div>
    </q-form>
  </div>
</template>

<script setup lang="ts">
import type { QForm } from 'quasar';

import { nextTick, ref, watch } from 'vue';

/*
 * ============================================================
 * Props
 * ============================================================
 */

const props = withDefaults(
  defineProps<{
    errorCount?: number;

    loading?: boolean;

    disabled?: boolean;
  }>(),
  {
    errorCount: 0,

    loading: false,

    disabled: false,
  },
);

/*
 * ============================================================
 * Emits
 * ============================================================
 */

const emit = defineEmits<{
  submit: [answers: Record<string, string>];
}>();

/*
 * ============================================================
 * Types
 * ============================================================
 */

interface DebugAnswerRow {
  lineNumber: number | null;

  answer: string;
}

/*
 * ============================================================
 * State
 * ============================================================
 */

const formRef = ref<QForm | null>(null);

const answerRows = ref<DebugAnswerRow[]>([]);

const localErrorMessage = ref('');

const normalizedErrorCount = ref(0);

/*
 * ============================================================
 * Build Rows
 * ============================================================
 *
 * Backend 只回 debug_error_count，
 * 不會回正確錯誤行號。
 *
 * 因此前端只依錯誤數量建立 N 組輸入欄位，
 * 行號必須由學生自行判斷並輸入。
 */

watch(
  () => props.errorCount,
  async (value) => {
    const nextCount =
      Number.isInteger(value) && Number(value) > 0
        ? Number(value)
        : 0;

    normalizedErrorCount.value = nextCount;

    answerRows.value = Array.from(
      {
        length: nextCount,
      },
      () => ({
        lineNumber: null,

        answer: '',
      }),
    );

    localErrorMessage.value = '';

    await nextTick();

    formRef.value?.resetValidation();
  },
  {
    immediate: true,
  },
);

/*
 * ============================================================
 * Validation
 * ============================================================
 */

function positiveIntegerRule(
  value: number | string | null | undefined,
) {
  const numberValue = Number(value);

  return (
    (Number.isInteger(numberValue) && numberValue > 0) ||
    '請輸入大於 0 的整數行號'
  );
}

function uniqueLineNumberRule(
  value: number | string | null | undefined,
  currentIndex: number,
) {
  const numberValue = Number(value);

  if (!Number.isInteger(numberValue) || numberValue <= 0) {
    return true;
  }

  const duplicated = answerRows.value.some(
    (item, index) =>
      index !== currentIndex &&
      item.lineNumber !== null &&
      Number(item.lineNumber) === numberValue,
  );

  return !duplicated || '同一個錯誤行號不可重複';
}

function requiredAnswerRule(
  value: string | null | undefined,
) {
  return Boolean(String(value ?? '').trim()) || '請填寫修正後程式碼';
}

/*
 * ============================================================
 * Error
 * ============================================================
 */

function resetBackendError() {
  localErrorMessage.value = '';
}

/*
 * ============================================================
 * Submit
 * ============================================================
 *
 * Backend 格式：
 *
 * {
 *   answers: {
 *     "2": "$name = \"Tom\";",
 *     "5": "echo $name;"
 *   }
 * }
 *
 * 這裡 emit 的只有 answers 本身，
 * Page 再交給共用 handleSubmitSubAnswers() 包裝。
 */

async function handleSubmit() {
  if (props.disabled || props.loading) {
    return;
  }

  const valid = await formRef.value?.validate();

  if (!valid) {
    return;
  }

  const answers: Record<string, string> = {};

  for (const item of answerRows.value) {
    if (item.lineNumber === null) {
      continue;
    }

    answers[String(item.lineNumber)] = item.answer.trim();
  }

  if (Object.keys(answers).length !== normalizedErrorCount.value) {
    localErrorMessage.value = '請完整填寫所有錯誤行號與修正內容';

    return;
  }

  emit('submit', answers);
}
</script>
