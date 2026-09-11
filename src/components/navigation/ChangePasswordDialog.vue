<template>
  <q-dialog v-model="dialogModel" persistent @hide="resetForm">
    <q-card class="change-password-dialog">
      <q-card-section class="change-password-dialog__header">
        <div>
          <div class="change-password-dialog__title">變更密碼</div>
          <div class="change-password-dialog__subtitle">
            請先輸入目前密碼，再設定新的登入密碼。
          </div>
        </div>

        <q-btn
          flat
          round
          dense
          icon="close"
          aria-label="關閉變更密碼視窗"
          :disable="changePasswordLoading"
          @click="closeDialog"
        />
      </q-card-section>

      <q-separator />

      <q-form ref="formRef" class="change-password-dialog__form" @submit="handleSubmit">
        <q-card-section class="change-password-dialog__body">
          <q-banner
            v-if="changePasswordErrorMessage"
            rounded
            class="change-password-dialog__error bg-red-1 text-negative"
          >
            <template #avatar>
              <q-icon name="error_outline" color="negative" />
            </template>

            {{ changePasswordErrorMessage }}
          </q-banner>

          <q-input
            v-model="currentPassword"
            outlined
            autocomplete="current-password"
            :type="showCurrentPassword ? 'text' : 'password'"
            label="目前密碼 *"
            :disable="changePasswordLoading"
            :error="Boolean(changePasswordFieldErrors.current_password)"
            :error-message="changePasswordFieldErrors.current_password"
            :rules="[(value) => !!String(value ?? '').trim() || '請輸入目前密碼']"
            lazy-rules="ondemand"
            @update:model-value="clearCurrentPasswordError"
          >
            <template #prepend>
              <q-icon name="lock" />
            </template>

            <template #append>
              <q-btn
                flat
                round
                dense
                :icon="showCurrentPassword ? 'visibility_off' : 'visibility'"
                :aria-label="showCurrentPassword ? '隱藏目前密碼' : '顯示目前密碼'"
                @click="showCurrentPassword = !showCurrentPassword"
              />
            </template>
          </q-input>

          <q-input
            v-model="newPassword"
            outlined
            autocomplete="new-password"
            :type="showNewPassword ? 'text' : 'password'"
            label="新密碼 *"
            hint="請設定新的登入密碼"
            :disable="changePasswordLoading"
            :error="Boolean(changePasswordFieldErrors.new_password)"
            :error-message="changePasswordFieldErrors.new_password"
            :rules="[(value) => !!String(value ?? '').trim() || '請輸入新密碼']"
            lazy-rules="ondemand"
            @update:model-value="clearNewPasswordError"
          >
            <template #prepend>
              <q-icon name="key" />
            </template>

            <template #append>
              <q-btn
                flat
                round
                dense
                :icon="showNewPassword ? 'visibility_off' : 'visibility'"
                :aria-label="showNewPassword ? '隱藏新密碼' : '顯示新密碼'"
                @click="showNewPassword = !showNewPassword"
              />
            </template>
          </q-input>

          <q-input
            v-model="confirmPassword"
            outlined
            autocomplete="new-password"
            :type="showConfirmPassword ? 'text' : 'password'"
            label="再次輸入新密碼 *"
            :disable="changePasswordLoading"
            :rules="[
              (value) => !!String(value ?? '').trim() || '請再次輸入新密碼',
              (value) => value === newPassword || '兩次輸入的新密碼不一致',
            ]"
            lazy-rules="ondemand"
          >
            <template #prepend>
              <q-icon name="verified_user" />
            </template>

            <template #append>
              <q-btn
                flat
                round
                dense
                :icon="showConfirmPassword ? 'visibility_off' : 'visibility'"
                :aria-label="showConfirmPassword ? '隱藏確認密碼' : '顯示確認密碼'"
                @click="showConfirmPassword = !showConfirmPassword"
              />
            </template>
          </q-input>

          <q-banner rounded class="change-password-dialog__notice bg-blue-1 text-blue-9">
            <template #avatar>
              <q-icon name="info" color="blue-7" />
            </template>

            密碼修改成功後會維持目前登入狀態，之後請使用新密碼登入。
          </q-banner>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="change-password-dialog__actions">
          <q-btn
            flat
            label="取消"
            :disable="changePasswordLoading"
            @click="closeDialog"
          />

          <q-btn
            unelevated
            color="primary"
            icon="password"
            label="儲存新密碼"
            type="submit"
            :loading="changePasswordLoading"
          />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from 'vue';
import type { QForm } from 'quasar';

import { useAuth } from '../../composables/useAuth';

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

const dialogModel = computed({
  get() {
    return props.modelValue;
  },

  set(value: boolean) {
    emit('update:modelValue', value);
  },
});

const formRef = ref<QForm | null>(null);

const currentPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');

const showCurrentPassword = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);

const {
  changePasswordLoading,
  changePasswordErrorMessage,
  changePasswordFieldErrors,
  changePassword,
  clearChangePasswordError,
} = useAuth();

function clearCurrentPasswordError() {
  clearChangePasswordError('current_password');
}

function clearNewPasswordError() {
  clearChangePasswordError('new_password');
}

async function handleSubmit() {
  const valid = await formRef.value?.validate();

  if (!valid) {
    return;
  }

  const success = await changePassword({
    current_password: currentPassword.value,
    new_password: newPassword.value,
    new_password_confirmation: confirmPassword.value,
  });

  if (!success) {
    return;
  }

  dialogModel.value = false;
}

function closeDialog() {
  if (changePasswordLoading.value) {
    return;
  }

  dialogModel.value = false;
}

async function resetForm() {
  currentPassword.value = '';
  newPassword.value = '';
  confirmPassword.value = '';

  showCurrentPassword.value = false;
  showNewPassword.value = false;
  showConfirmPassword.value = false;

  clearChangePasswordError();

  await nextTick();
  formRef.value?.resetValidation();
}
</script>
