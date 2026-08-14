<template>
  <q-dialog v-model="dialogModel" persistent>
    <q-card class="teacher-account-result-dialog">
      <!-- 成功標題 -->
      <q-card-section class="teacher-account-result-dialog__header">
        <q-icon name="check_circle" color="positive" size="48px" />

        <div class="text-h6 text-weight-bold">教師帳號建立成功</div>

        <div class="text-body2 text-grey-7">請妥善保存以下帳號資訊</div>
      </q-card-section>

      <q-separator />

      <!-- 帳號資訊 -->
      <q-card-section class="teacher-account-result-dialog__content">
        <!-- 教師姓名 -->
        <div v-if="teacherName" class="teacher-account-result-dialog__row">
          <span class="teacher-account-result-dialog__label"> 教師姓名 </span>

          <span>
            {{ teacherName }}
          </span>
        </div>

        <!-- 帳號 -->
        <div class="teacher-account-result-dialog__row">
          <span class="teacher-account-result-dialog__label"> 帳號 </span>

          <div class="teacher-account-result-dialog__value">
            <span>
              {{ result.account }}
            </span>

            <q-btn flat round dense icon="content_copy" @click="copyText(result.account)">
              <q-tooltip> 複製帳號 </q-tooltip>
            </q-btn>
          </div>
        </div>

        <!-- 密碼 -->
        <div class="teacher-account-result-dialog__row">
          <span class="teacher-account-result-dialog__label"> 密碼 </span>

          <div class="teacher-account-result-dialog__value">
            <span class="teacher-account-result-dialog__password">
              {{ result.password }}
            </span>

            <q-btn flat round dense icon="content_copy" @click="copyText(result.password)">
              <q-tooltip> 複製密碼 </q-tooltip>
            </q-btn>
          </div>
        </div>

        <!-- 提醒 -->
        <q-banner rounded class="teacher-account-result-dialog__warning bg-orange-1 text-orange-10">
          <template #avatar>
            <q-icon name="warning" />
          </template>

          此密碼為系統產生的初始密碼，請先保存後再關閉此視窗。
        </q-banner>
      </q-card-section>

      <!-- Button -->
      <q-card-actions align="right" class="teacher-account-result-dialog__actions">
        <q-btn label="完成" color="primary" unelevated @click="handleClose" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import type { TeacherAccountResult } from '../../../types/teacher-application';

const props = defineProps<{
  modelValue: boolean;
  result: TeacherAccountResult;
  teacherName?: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  close: [];
}>();

const dialogModel = computed({
  get() {
    return props.modelValue;
  },

  set(value: boolean) {
    emit('update:modelValue', value);
  },
});

async function copyText(text: string) {
  await navigator.clipboard.writeText(text);
}

function handleClose() {
  dialogModel.value = false;
  emit('close');
}
</script>
