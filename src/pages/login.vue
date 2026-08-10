<template>
  <q-layout view="hHh lpR fFf">
    <q-page-container>
      <q-page class="login-page flex flex-center">
        <q-card class="login-card q-pa-lg">
          <!-- 標題 -->
          <q-card-section class="text-center">
            <div class="text-h4 text-weight-bold">
              登入
            </div>
          </q-card-section>

          <!-- 登入表單 -->
          <q-card-section>
            <q-form
              class="q-gutter-y-md"
              @submit="handleLogin"
            >
              <!-- 帳號 -->
              <q-input
                v-model="account"
                outlined
                label="帳號"
                autocomplete="username"
                :rules="[
                  (value) => !!value || '請輸入帳號',
                ]"
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
                :rules="[
                  (value) => !!value || '請輸入密碼',
                ]"
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
              <div
                v-if="errorMessage"
                class="text-negative text-center"
              >
                {{ errorMessage }}
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
                  <router-link to="/register">點此申請</router-link>
                </div>
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '../composables/useAuth'

const account = ref('')
const password = ref('')
const showPassword = ref(false)

const {
  login,
  loading,
  errorMessage,
} = useAuth()

async function handleLogin() {
  await login({
    account: account.value,
    password: password.value,
  })
}
</script>
