export interface TeacherApplicationRequest {
  name: string;
  email: string;
  reason: string;
}

export interface TeacherApplication {
  id: number;
  name: string;
  email: string;
  reason: string;
  status: 'pending';
}

export interface TeacherApplicationResponse {
  message: string;
  data: TeacherApplication;
}
