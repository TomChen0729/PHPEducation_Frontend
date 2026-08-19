export interface TeacherApplicationRequest {
  name: string;
  email: string;
  account: string;
  reason?: string;
}

export interface TeacherApplication {
  id: number;
  name: string;
  email: string;
  account: string;
  reason: string | null;
  status: 'pending' | 'approved';
}

export interface TeacherApplicationResponse {
  message: string;
  data: TeacherApplication;
}

export interface TeacherAccountResult {
  tid: number;
  account: string;
  password: string;
  status: 'approved';
}

export interface ApproveTeacherResponse {
  message: string;
  data: TeacherAccountResult;
}

export interface TeacherApplicationErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
}
