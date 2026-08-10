export type UserRole = 'admin' | 'teacher' | 'student'

export interface User {
  id: number
  account: string
  name: string
  role: UserRole
}

export interface LoginRequest {
  account: string
  password: string
}

export interface LoginResponse {
  token: string
  token_type: 'Bearer'
  user: User
}

export interface MeResponse {
  user: User
}

export interface LoginErrorResponse {
  statusCode: number
  message: string
}
