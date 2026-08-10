import { api } from '../boot/axios'
import type {
  LoginRequest,
  LoginResponse,
  MeResponse,
} from '../types/auth'

export const authApi = {
  login(data: LoginRequest) {
    return api.post<LoginResponse>('/auth/login', data)
  },

  me() {
    return api.get<MeResponse>('/auth/me')
  },
}
