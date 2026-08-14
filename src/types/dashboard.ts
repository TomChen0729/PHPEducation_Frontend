import type { User } from './auth';

export interface DashboardCourse {
  id: number;
  name: string;
  semester: string;
  teacher_id: number;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface CourseDashboardResponse {
  user: User;
  courses: DashboardCourse[];
}

export interface AdminDashboardResponse {
  user: User;
  pending_count: number;
}

export type DashboardResponse = CourseDashboardResponse | AdminDashboardResponse;
