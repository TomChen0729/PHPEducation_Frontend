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
            <q-form class="teacherApplication-form" @submit="handleSubmit">
              <!-- 姓名 -->
              <q-input
                v-model="name"
                label="姓名"
                outlined
                :rules="[(value) => !!value || '請輸入姓名']"
              />

              <!-- Email -->
              <q-input
                v-model="email"
                label="Eportal Email"
                type="email"
                outlined
                :rules="[
                  (value) => !!value || '請輸入 Eportal Email',
                  (value) => emailPattern.test(value) || '格式不正確',
                ]"
              />

              <!-- 帳號名稱 -->
              <q-input
                v-model="account"
                label="帳號名稱"
                type="text"
                outlined
                :rules="[(value) => !!value || '請輸入帳號名稱']"
              />

              <!-- 申請原因 -->
              <q-input v-model="reason" label="申請原因" type="textarea" outlined autogrow />

              <!-- 錯誤訊息 -->
              <div v-if="errorMessage" class="teacherApplication-form__error">
                {{ errorMessage }}
              </div>

              <!-- 成功訊息 -->
              <div v-if="successMessage" class="teacherApplication-form__success">
                {{ successMessage }}
              </div>

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
import { ref } from 'vue';

import { useTeacherApplication } from '../composables/useTeacherApplication';

const name = ref('');
const email = ref('');
const account = ref('');
const reason = ref('');

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const { loading, errorMessage, successMessage, submitApplication } = useTeacherApplication();

definePage({
  meta: {
    requiresAuth: false,
  },
});

async function handleSubmit() {
  const success = await submitApplication({
    name: name.value,
    email: email.value,
    account: account.value,
    reason: reason.value,
  });

  if (!success) {
    return;
  }

  name.value = '';
  email.value = '';
  account.value = '';
  reason.value = '';
}
</script>
