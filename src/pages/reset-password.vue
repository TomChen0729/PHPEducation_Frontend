<template>
  <q-layout view="hHh lpR fFf">
    <q-page-container>
      <q-page class="login-page flex flex-center">
        <q-card class="reset-password-card q-pa-lg">
          <template v-if="resetCompleted">
            <q-card-section class="text-center">
              <q-icon name="check_circle" color="positive" size="64px" />

              <div class="text-h5 text-weight-bold q-mt-md">密碼重設完成</div>

              <div class="text-body2 text-grey-7 q-mt-sm">
                原密碼已失效，請使用剛設定的新密碼重新登入。
              </div>
            </q-card-section>

            <q-card-section>
              <q-btn
                unelevated
                color="blue-grey-7"
                class="full-width"
                size="lg"
                label="前往登入"
                @click="goToLogin"
              />
            </q-card-section>
          </template>

          <template v-else-if="!hasValidLinkParams">
            <q-card-section class="text-center">
              <q-icon name="link_off" color="negative" size="64px" />

              <div class="text-h5 text-weight-bold q-mt-md">重設連結無效</div>

              <div class="text-body2 text-grey-7 q-mt-sm">
                此連結缺少必要資訊，請回登入頁重新申請忘記密碼。
              </div>
            </q-card-section>

            <q-card-section>
              <q-btn
                unelevated
                color="blue-grey-7"
                class="full-width"
                label="回登入頁"
                @click="goToLogin"
              />
            </q-card-section>
          </template>

          <template v-else>
            <q-card-section class="text-center">
              <div class="text-h4 text-weight-bold">重設密碼</div>

              <div class="text-body2 text-grey-7 q-mt-xs">
                {{ resetType === 'student' ? '學生帳號' : '教師帳號' }}
              </div>
            </q-card-section>

            <q-card-section>
              <q-banner rounded class="reset-password-card__expiry-banner">
                <template #avatar>
                  <q-icon name="schedule" color="orange-9" />
                </template>

                <div class="text-weight-medium">重設連結自寄出起 15 分鐘內有效</div>
                <div class="text-body2 q-mt-xs">
                  此連結只能使用一次。若連結已超過 15 分鐘、已使用過，或您再次申請過忘記密碼，請回登入頁重新申請。
                </div>
              </q-banner>
            </q-card-section>

            <q-card-section>
              <q-form ref="formRef" class="q-gutter-y-md" @submit="handleResetPassword">
                <q-input
                  v-model="newPassword"
                  outlined
                  label="新密碼"
                  :type="showNewPassword ? 'text' : 'password'"
                  autocomplete="new-password"
                  lazy-rules="ondemand"
                  :disable="resetPasswordLoading"
                  :error="!!resetPasswordFieldErrors.new_password"
                  :error-message="resetPasswordFieldErrors.new_password"
                  :rules="[
                    (value) => !!String(value ?? '') || '請輸入新密碼',
                    (value) => String(value ?? '').length >= 6 || '新密碼至少 6 碼',
                  ]"
                  @update:model-value="clearResetPasswordError('new_password')"
                >
                  <template #prepend>
                    <q-icon name="lock" />
                  </template>

                  <template #append>
                    <q-icon
                      :name="showNewPassword ? 'visibility_off' : 'visibility'"
                      class="cursor-pointer"
                      @click="showNewPassword = !showNewPassword"
                    />
                  </template>
                </q-input>

                <q-input
                  v-model="newPasswordConfirmation"
                  outlined
                  label="再次輸入新密碼"
                  :type="showConfirmation ? 'text' : 'password'"
                  autocomplete="new-password"
                  lazy-rules="ondemand"
                  :disable="resetPasswordLoading"
                  :error="!!resetPasswordFieldErrors.new_password_confirmation"
                  :error-message="resetPasswordFieldErrors.new_password_confirmation"
                  :rules="[
                    (value) => !!String(value ?? '') || '請再次輸入新密碼',
                    (value) => value === newPassword || '兩次輸入的新密碼不一致',
                  ]"
                  @update:model-value="clearResetPasswordError('new_password_confirmation')"
                >
                  <template #prepend>
                    <q-icon name="lock_reset" />
                  </template>

                  <template #append>
                    <q-icon
                      :name="showConfirmation ? 'visibility_off' : 'visibility'"
                      class="cursor-pointer"
                      @click="showConfirmation = !showConfirmation"
                    />
                  </template>
                </q-input>

                <q-banner
                  v-if="resetPasswordErrorMessage"
                  rounded
                  class="bg-red-1 text-negative"
                >
                  <template #avatar>
                    <q-icon name="error_outline" color="negative" />
                  </template>

                  {{ resetPasswordErrorMessage }}
                </q-banner>

                <div class="reset-password-card__actions">
                  <q-btn
                    flat
                    no-caps
                    label="回登入頁"
                    :disable="resetPasswordLoading"
                    @click="goToLogin"
                  />

                  <q-btn
                    type="submit"
                    unelevated
                    no-caps
                    color="blue-grey-7"
                    icon="lock_reset"
                    label="設定新密碼"
                    :loading="resetPasswordLoading"
                  />
                </div>
              </q-form>
            </q-card-section>
          </template>
        </q-card>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { useAuth } from '../composables/useAuth';

import type { ForgotPasswordRole } from '../types/auth';
import type { QForm } from 'quasar';

const route = useRoute();
const router = useRouter();

const formRef = ref<QForm | null>(null);

const newPassword = ref('');
const newPasswordConfirmation = ref('');

const showNewPassword = ref(false);
const showConfirmation = ref(false);
const resetCompleted = ref(false);

const resetType = computed<ForgotPasswordRole | null>(() => {
  const type = route.query.type;

  return type === 'student' || type === 'teacher' ? type : null;
});

const resetToken = computed(() => {
  const token = route.query.token;

  return typeof token === 'string' ? token.trim() : '';
});

const hasValidLinkParams = computed(() => {
  return resetType.value !== null && resetToken.value.length > 0;
});

const {
  resetPassword,
  resetPasswordLoading,
  resetPasswordErrorMessage,
  resetPasswordFieldErrors,
  clearResetPasswordError,
} = useAuth();

async function handleResetPassword() {
  if (!resetType.value || !resetToken.value) {
    return;
  }

  const valid = await formRef.value?.validate();

  if (valid === false) {
    return;
  }

  const success = await resetPassword({
    type: resetType.value,
    token: resetToken.value,
    new_password: newPassword.value,
    new_password_confirmation: newPasswordConfirmation.value,
  });

  if (success) {
    resetCompleted.value = true;
    newPassword.value = '';
    newPasswordConfirmation.value = '';
  }
}

async function goToLogin() {
  clearResetPasswordError();

  await router.replace('/login');
}
</script>
