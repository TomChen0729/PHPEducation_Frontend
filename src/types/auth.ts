export type UserRole = 'admin' | 'teacher' | 'student';

export type ForgotPasswordRole = 'teacher' | 'student';

export interface User {
  id: number;
  account: string;
  name: string;
  role: UserRole;
}

export interface LoginRequest {
  account: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  token_type: 'Bearer';
  user: User;
}

export interface MeResponse {
  user: User;
}

export interface LogoutResponse {
  message: string;
}

export interface LoginErrorResponse {
  statusCode: number;
  message: string;
}

export interface StudentForgotPasswordRequest {
  student_no: string;
}

export interface TeacherForgotPasswordRequest {
  teacher_account: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface ValidationErrorResponse {
  message?: string;
  errors?: Record<string, string[]>;
}
