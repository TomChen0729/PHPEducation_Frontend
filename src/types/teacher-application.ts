export type TeacherApplicationStatus = 'pending' | 'approved';

export interface TeacherApplication {
  id: number;

  name: string;
  email: string;

  reason: string | null;

  status: TeacherApplicationStatus;
}

export interface TeacherApplicationRequest {
  name: string;
  email: string;

  reason?: string | null;
}

export interface TeacherApplicationResponse {
  message: string;

  data: TeacherApplication;
}

export interface TeacherApplicationListResponse {
  applications: TeacherApplication[];
}

export interface TeacherApprovalResponse {
  message: string;

  data: {
    tid: number;

    name: string;
    email: string;

    account: string;
  };
}
