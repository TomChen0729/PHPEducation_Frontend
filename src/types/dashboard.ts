import type { User } from './auth';

export interface DashboardCourse {
  id: number;
  name: string;
  description: string | null;
  semester: string;
  teacher_id: number;
}

export interface DashboardResponse {
  user: User;

  // Teacher / Student
  courses?: DashboardCourse[];

  // Admin
  pending_count?: number;
}
