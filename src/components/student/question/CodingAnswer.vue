<template>
  <div class="student-coding-answer">
    <q-banner rounded class="student-coding-answer__notice">
      <template #avatar>
        <q-icon name="code" color="indigo-7" />
      </template>

      <div class="student-coding-answer__notice-title">
        請在下方完成程式實作
      </div>

      <div class="student-coding-answer__notice-text">
        若老師有提供初始程式碼，請直接在原內容上繼續完成。送出後會等待教師覆核。
      </div>
    </q-banner>

    <div class="student-coding-answer__editor-label">
      <q-icon name="terminal" />
      我的程式碼
    </div>

    <CodeEditor
      v-model="code"
      theme="student"
      :disabled="disabled || loading"
    />

    <div
      v-if="validationMessage"
      class="student-coding-answer__error"
    >
      <q-icon name="error_outline" />
      {{ validationMessage }}
    </div>

    <div class="student-coding-answer__actions">
      <q-btn
        unelevated
        color="teal"
        icon="send"
        label="送出程式"
        no-caps
        :loading="loading"
        :disable="disabled"
        @click="submit"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

import CodeEditor from '../../common/CodeEditor.vue';

const props = withDefaults(
  defineProps<{
    starterCode?: string | null;

    loading?: boolean;

    disabled?: boolean;
  }>(),
  {
    starterCode: '',

    loading: false,

    disabled: false,
  },
);

const emit = defineEmits<{
  submit: [code: string];
}>();

const code = ref('');

const validationMessage = ref('');

watch(
  () => props.starterCode,
  (value) => {
    code.value = value ?? '';

    validationMessage.value = '';
  },
  {
    immediate: true,
  },
);

function submit() {
  if (props.disabled || props.loading) {
    return;
  }

  if (!code.value.trim()) {
    validationMessage.value = '請先完成程式碼再送出';

    return;
  }

  validationMessage.value = '';

  emit('submit', code.value);
}
</script>
