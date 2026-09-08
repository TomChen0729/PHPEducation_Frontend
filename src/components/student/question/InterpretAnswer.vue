<template>
  <div class="student-interpret-answer">
    <q-form
      ref="formRef"
      class="student-interpret-answer__form"
      @submit="submit"
    >
      <div class="student-interpret-answer__field">
        <div class="student-interpret-answer__field-label">
          程式解讀答案
        </div>

        <q-input
          v-model="answer"
          outlined
          type="textarea"
          autogrow
          clearable
          label="請輸入程式執行結果或解讀 *"
          hint="請依題目要求判斷執行結果，必要時說明推演過程。"
          :disable="disabled"
          :rules="[requiredAnswerRule]"
          lazy-rules="ondemand"
        >
          <template #prepend>
            <q-icon name="psychology" color="purple-7" />
          </template>
        </q-input>
      </div>

      <div class="student-interpret-answer__actions">
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
import { nextTick, ref, watch } from 'vue';

import type { QForm } from 'quasar';

const props = withDefaults(
  defineProps<{
    subId?: number;

    loading?: boolean;

    disabled?: boolean;
  }>(),
  {
    subId: 1,

    loading: false,

    disabled: false,
  },
);

const emit = defineEmits<{
  submit: [answers: Record<string, string>];
}>();

const formRef = ref<QForm | null>(null);

const answer = ref('');

function requiredAnswerRule(value: string | null | undefined) {
  return Boolean(String(value ?? '').trim()) || '請填寫答案';
}

async function resetAnswer() {
  answer.value = '';

  await nextTick();

  formRef.value?.resetValidation();
}

watch(
  () => props.subId,
  () => {
    void resetAnswer();
  },
  {
    immediate: true,
  },
);

async function submit() {
  if (props.disabled || props.loading) {
    return;
  }

  const valid = await formRef.value?.validate();

  if (valid === false) {
    return;
  }

  emit('submit', {
    [String(props.subId)]: answer.value.trim(),
  });
}
</script>
