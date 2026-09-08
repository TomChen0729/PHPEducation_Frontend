<template>
  <div class="student-fill-answer">
    <!-- =====================================================
         Empty
    ====================================================== -->
    <div v-if="subIds.length === 0" class="student-fill-answer__empty">
      <q-icon name="error_outline" size="32px" color="grey-5" />

      <div>此題目前沒有可作答的填空欄位</div>
    </div>

    <!-- =====================================================
         Form
    ====================================================== -->
    <q-form
      v-else
      ref="formRef"
      class="student-fill-answer__form"
      @submit="submit"
    >
      <div class="student-fill-answer__fields">
        <div
          v-for="subId in subIds"
          :key="subId"
          class="student-fill-answer__field"
        >
          <div class="student-fill-answer__field-label">
            填空（{{ subId }}）
          </div>

          <q-input
            v-model="answers[String(subId)]"
            outlined
            clearable
            :label="`答案 ${subId} *`"
            :disable="disabled"
            :rules="[requiredAnswerRule]"
            lazy-rules="ondemand"
          >
            <template #prepend>
              <q-icon name="edit" color="orange-7" />
            </template>
          </q-input>
        </div>
      </div>

      <div class="student-fill-answer__actions">
        <q-btn
          type="submit"
          unelevated
          color="teal"
          icon="send"
          label="送出答案"
          no-caps
          :loading="loading"
          :disable="disabled"
        />
      </div>
    </q-form>
  </div>
</template>

<script setup lang="ts">
import { nextTick, reactive, ref, watch } from 'vue';

import type { QForm } from 'quasar';

/*
 * ============================================================
 * Props
 * ============================================================
 */

const props = withDefaults(
  defineProps<{
    /*
     * Backend 只回需要作答的 sub_id，
     * 不會回標準答案。
     */
    subIds: number[];

    loading?: boolean;

    disabled?: boolean;
  }>(),
  {
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
 * Form
 * ============================================================
 */

const formRef = ref<QForm | null>(null);

/*
 * Backend Submit 格式：
 *
 * {
 *   answers: {
 *     "1": "...",
 *     "2": "..."
 *   }
 * }
 */
const answers = reactive<Record<string, string | null>>({});

/*
 * ============================================================
 * Validation
 * ============================================================
 */

function requiredAnswerRule(value: string | null | undefined) {
  return Boolean(String(value ?? '').trim()) || '請填寫答案';
}

/*
 * ============================================================
 * Reset
 * ============================================================
 */

async function resetAnswers() {
  Object.keys(answers).forEach((key) => {
    delete answers[key];
  });

  props.subIds.forEach((subId) => {
    answers[String(subId)] = '';
  });

  await nextTick();

  formRef.value?.resetValidation();
}

/*
 * 題目切換時清空上一題答案與驗證狀態。
 */
watch(
  () => props.subIds,
  () => {
    void resetAnswers();
  },
  {
    immediate: true,
    deep: true,
  },
);

/*
 * ============================================================
 * Submit
 * ============================================================
 */

async function submit() {
  if (props.disabled || props.loading) {
    return;
  }

  const valid = await formRef.value?.validate();

  if (valid === false) {
    return;
  }

  const payload: Record<string, string> = {};

  props.subIds.forEach((subId) => {
    payload[String(subId)] =
      answers[String(subId)]?.trim() ?? '';
  });

  emit('submit', payload);
}
</script>
