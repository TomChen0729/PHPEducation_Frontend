import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type {
  LoginResponse,
  User,
} from '../types/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)

  const token = ref<string | null>(
    sessionStorage.getItem('auth_token'),
  )

  const isLoggedIn = computed(
    () => token.value !== null,
  )

  const role = computed(
    () => user.value?.role ?? null,
  )

  function setAuth(data: LoginResponse) {
    token.value = data.token
    user.value = data.user

    sessionStorage.setItem(
      'auth_token',
      data.token,
    )
  }

  function setUser(data: User) {
    user.value = data
  }

  function clearAuth() {
    user.value = null
    token.value = null

    sessionStorage.removeItem('auth_token')
  }

  return {
    user,
    token,
    role,
    isLoggedIn,
    setAuth,
    setUser,
    clearAuth,
  }
})
