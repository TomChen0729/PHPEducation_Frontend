<template>
  <q-layout view="hHh lpR fFf">
    <q-page-container>
      <q-page class="teacherApplication-page">
        <q-card class="teacherApplication-card">
          <!-- 標題 -->
          <q-card-section class="teacherApplication-card__header">
            <div class="text-h4 text-weight-bold">教師帳號申請</div>

            <div class="text-body2 text-grey-7">請填寫以下資料送出申請</div>
          </q-card-section>

          <!-- 表單 -->
          <q-card-section>
            <q-form class="teacherApplication-form" ref="formRef" @submit="handleSubmit">
              <!-- 姓名 -->
              <q-input
                v-model="form.name"
                label="姓名*"
                outlined
                lazy-rules="ondemand"
                :rules="[(value) => !!value || '請輸入姓名']"
              />

              <!-- Email -->
              <q-input
                v-model="form.email"
                label="Eportal 信箱*"
                type="email"
                outlined
                lazy-rules="ondemand"
                :rules="[
                  (value) => !!value || '請輸入 Eportal 信箱',
                  (value) => emailPattern.test(value) || '格式不正確',
                ]"
              />

              <!-- 帳號名稱 -->
              <q-input
                v-model="form.account"
                label="帳號名稱*"
                type="text"
                outlined
                lazy-rules="ondemand"
                :rules="[(value) => !!value || '請輸入帳號名稱']"
              />

              <!-- 申請原因 -->
              <q-input
                v-model="form.reason"
                label="申請原因*"
                type="textarea"
                outlined
                lazy-rules="ondemand"
                :rules="[(value) => !!value || '請輸入申請原因']"
              />

              <!-- 錯誤訊息 -->
              <div v-if="errorMessage" class="teacherApplication-form__error">
                {{ errorMessage }}
              </div>

              <!-- 成功訊息 -->
              <!-- <div v-if="successMessage" class="teacherApplication-form__success">
                {{ successMessage }}
              </div> -->

              <!-- 送出 -->
              <q-btn
                class="teacherApplication-form__submit"
                label="送出申請"
                type="submit"
                color="light-blue-8"
                size="lg"
                unelevated
                :loading="loading"
              />

              <!-- 返回登入 -->
              <div class="teacherApplication-form__back">
                已有帳號？

                <router-link to="/login"> 返回登入 </router-link>
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { reactive, ref, nextTick } from 'vue';
import { Notify } from 'quasar';
import type { QForm } from 'quasar';

import { useTeacherApplication } from '../composables/useTeacherApplication';

const form = reactive({
  name: '',
  email: '',
  account: '',
  reason: '',
});

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const formRef = ref<QForm | null>(null);

const { loading, errorMessage, submitApplication } = useTeacherApplication();

definePage({
  meta: {
    requiresAuth: false,
  },
});

async function handleSubmit() {
  const success = await submitApplication({
    name: form.name.trim(),
    email: form.email.trim(),
    account: form.account.trim(),
    reason: form.reason.trim() || '',
  });

  if (!success) {
    Notify.create({
      type: 'negative',
      message: errorMessage.value || '申請失敗',
      position: 'top',
      timeout: 2000,
    });

    return;
  }

  Notify.create({
    type: 'positive',
    message: '教師帳號申請已送出，請等待審核',
    position: 'top',
    timeout: 2000,
  });

  resetForm();

  await nextTick();

  formRef.value?.resetValidation();
}

function resetForm() {
  form.name = '';
  form.email = '';
  form.account = '';
  form.reason = '';
}
</script>
