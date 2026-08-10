import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

import { authApi } from '../api/auth.api'
import { useAuthStore } from '../stores/auth'
import { getHomePathByRole } from '../utils/auth-route'

import type {
  LoginRequest,
  LoginErrorResponse,
  UserRole,
} from '../types/auth'

export function useAuth() {
  const router = useRouter()
  const authStore = useAuthStore()

  const loading = ref(false)
  const errorMessage = ref('')

  async function login(data: LoginRequest) {
    loading.value = true
    errorMessage.value = ''

    try {
      const response = await authApi.login(data)

      // 儲存 Token 與登入者資料
      authStore.setAuth(response.data)

      // 根據角色跳轉
      await redirectByRole(response.data.user.role)
    } catch (error: unknown) {
      if (axios.isAxiosError<LoginErrorResponse>(error)) {
        const responseData = error.response?.data

        if (responseData?.message) {
          errorMessage.value = responseData.message
        } else {
          errorMessage.value = '登入失敗，請稍後再試'
        }
      } else {
        errorMessage.value = '登入失敗，請稍後再試'
      }
    } finally {
      loading.value = false
    }
  }

  async function redirectByRole(role: UserRole) {
    await router.replace(getHomePathByRole(role))
  }

  return {
    loading,
    errorMessage,
    login,
  }
}
