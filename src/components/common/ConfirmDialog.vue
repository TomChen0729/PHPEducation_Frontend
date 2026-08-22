<template>
  <q-dialog v-model="dialogModel" :persistent="persistent">
    <q-card class="confirm-dialog">
      <!-- 標題 -->
      <q-card-section class="confirm-dialog__header">
        <div class="text-h6">
          {{ title }}
        </div>
      </q-card-section>

      <!-- 內容 -->
      <q-card-section class="confirm-dialog__message">
        <slot name="message">
          {{ message }}
        </slot>
      </q-card-section>

      <!-- 按鈕 -->
      <q-card-actions align="right" class="confirm-dialog__actions">
        <q-btn flat :label="cancelLabel" :disable="loading" @click="handleCancel" />

        <q-btn
          unelevated
          :label="confirmLabel"
          :color="confirmColor"
          :loading="loading"
          @click="handleConfirm"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    title: string;
    message: string;

    confirmLabel?: string;
    cancelLabel?: string;
    confirmColor?: string;

    loading?: boolean;
    persistent?: boolean;
  }>(),
  {
    confirmLabel: '確定',
    cancelLabel: '取消',
    confirmColor: 'primary',
    loading: false,
    persistent: false,
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  confirm: [];
  cancel: [];
}>();

const dialogModel = computed({
  get() {
    return props.modelValue;
  },

  set(value: boolean) {
    emit('update:modelValue', value);
  },
});

function handleConfirm() {
  emit('confirm');
}

function handleCancel() {
  emit('cancel');
  dialogModel.value = false;
}
</script>
