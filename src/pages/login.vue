<template>
  <q-layout view="hHh lpR fFf">
    <q-page-container>
      <q-page class="login-page flex flex-center">
        <q-card class="login-card q-pa-lg">
          <!-- 標題 -->
          <q-card-section class="text-center">
            <div class="text-h4 text-weight-bold">登入</div>
          </q-card-section>

          <!-- 登入表單 -->
          <q-card-section>
            <q-form class="q-gutter-y-md" @submit="handleLogin">
              <!-- 帳號 -->
              <q-input
                v-model="account"
                outlined
                label="帳號"
                autocomplete="username"
                :rules="[(value) => !!value || '請輸入帳號']"
              >
                <template #prepend>
                  <q-icon name="person" />
                </template>
              </q-input>

              <!-- 密碼 -->
              <q-input
                v-model="password"
                outlined
                label="密碼"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                :rules="[(value) => !!value || '請輸入密碼']"
              >
                <template #prepend>
                  <q-icon name="lock" />
                </template>

                <template #append>
                  <q-icon
                    :name="showPassword ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer"
                    @click="showPassword = !showPassword"
                  />
                </template>
              </q-input>
              <div v-if="errorMessage" class="text-negative text-center">
                {{ errorMessage }}
              </div>

              <div class="login-card__forgot-password">
                <q-btn
                  flat
                  dense
                  no-caps
                  color="blue-grey-7"
                  label="忘記密碼？"
                  @click="openForgotPasswordDialog"
                />
              </div>

              <!-- 登入按鈕 -->
              <q-btn
                type="submit"
                label="登入"
                color="blue-grey-7"
                class="full-width"
                size="lg"
                :loading="loading"
                unelevated
              />

              <!-- 教師帳號申請 -->
              <div class="text-center">
                <div class="text-subtitle2">
                  教師帳號申請？
                  <router-link to="/teacherApplication">點此申請</router-link>
                </div>
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </q-page>
    </q-page-container>

    <q-dialog v-model="forgotPasswordDialog" @hide="resetForgotPasswordDialog">
      <q-card class="forgot-password-dialog">
        <q-card-section class="forgot-password-dialog__header row items-start no-wrap">
          <div>
            <div class="text-h6 text-weight-bold">忘記密碼</div>

            <div class="text-body2 text-grey-7 q-mt-xs">選擇身分後輸入帳號</div>
          </div>

          <q-space />

          <q-btn v-close-popup flat round dense icon="close" aria-label="關閉" />
        </q-card-section>

        <q-separator />

        <q-card-section class="forgot-password-dialog__content">
          <q-form ref="forgotPasswordFormRef" class="q-gutter-y-md" @submit="handleForgotPassword">
            <!-- 身分 -->
            <div>
              <div class="text-subtitle2 text-weight-medium q-mb-sm">身分</div>

              <q-btn-toggle
                v-model="forgotPasswordRole"
                spread
                no-caps
                unelevated
                toggle-color="blue-grey-7"
                color="grey-2"
                text-color="blue-grey-8"
                :options="forgotPasswordRoleOptions"
                @update:model-value="handleForgotPasswordRoleChange"
              />
            </div>

            <!-- 提醒 -->
            <q-banner rounded class="bg-blue-grey-1 text-blue-grey-9">
              <template #avatar>
                <q-icon name="info" color="blue-grey-7" />
              </template>

              送出後系統會立即產生新的 12 碼密碼， 並寄到帳號綁定的信箱。 原密碼將無法再使用。
            </q-banner>

            <!-- 帳號 -->
            <q-input
              v-model="forgotPasswordAccount"
              outlined
              autofocus
              lazy-rules="ondemand"
              :label="forgotPasswordRole === 'student' ? '學生學號' : '教師帳號'"
              :disable="forgotPasswordLoading"
              :rules="[
                (value) =>
                  !!String(value ?? '').trim() ||
                  (forgotPasswordRole === 'student' ? '請輸入學號' : '請輸入教師帳號'),
              ]"
              @update:model-value="clearForgotPasswordError"
            >
              <template #prepend>
                <q-icon :name="forgotPasswordRole === 'student' ? 'school' : 'person'" />
              </template>
            </q-input>

            <!-- Backend 錯誤 -->
            <div v-if="forgotPasswordErrorMessage" class="text-negative text-body2">
              {{ forgotPasswordErrorMessage }}
            </div>

            <!-- 提示 -->
            <div class="text-caption text-grey-7">
              <template v-if="forgotPasswordRole === 'student'">
                學號可直接輸入，例如：1411131000，不需要加 s。
              </template>

              <template v-else> 請輸入教師登入時使用的帳號。 </template>
            </div>

            <!-- Buttons -->
            <div class="forgot-password-dialog__actions">
              <q-btn v-close-popup flat no-caps label="取消" :disable="forgotPasswordLoading" />

              <q-btn
                type="submit"
                unelevated
                no-caps
                color="blue-grey-7"
                icon="mail"
                label="寄送新密碼"
                :loading="forgotPasswordLoading"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script setup lang="ts">
import { nextTick, ref } from 'vue';
import { useAuth } from '../composables/useAuth';

import type { ForgotPasswordRole } from '../types/auth';
import type { QForm } from 'quasar';

const account = ref('');
const password = ref('');
const showPassword = ref(false);

const forgotPasswordDialog = ref(false);

const forgotPasswordRole = ref<ForgotPasswordRole>('student');

const forgotPasswordAccount = ref('');

const forgotPasswordFormRef = ref<QForm | null>(null);

const {
  login,
  loading,
  errorMessage,

  forgotPassword,
  forgotPasswordLoading,
  forgotPasswordErrorMessage,
  clearForgotPasswordError,
} = useAuth();

const forgotPasswordRoleOptions: Array<{
  label: string;
  value: ForgotPasswordRole;
}> = [
  {
    label: '學生',
    value: 'student',
  },
  {
    label: '教師',
    value: 'teacher',
  },
];

async function handleLogin() {
  await login({
    account: account.value,
    password: password.value,
  });
}

function openForgotPasswordDialog() {
  void resetForgotPasswordDialog();

  forgotPasswordDialog.value = true;
}

async function handleForgotPasswordRoleChange() {
  // 清空上一個身分輸入的帳號
  forgotPasswordAccount.value = '';

  // 清除 Backend / API 錯誤
  clearForgotPasswordError();

  // 等待學生 / 教師欄位切換完成
  await nextTick();

  // 清除 q-input rules 的紅框與錯誤訊息
  forgotPasswordFormRef.value?.resetValidation();
}

async function resetForgotPasswordDialog() {
  forgotPasswordRole.value = 'student';
  forgotPasswordAccount.value = '';

  clearForgotPasswordError();

  await nextTick();

  forgotPasswordFormRef.value?.resetValidation();
}

async function handleForgotPassword() {
  const success = await forgotPassword(forgotPasswordRole.value, forgotPasswordAccount.value);

  if (success) {
    forgotPasswordDialog.value = false;
  }
}
</script>
