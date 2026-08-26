/*
 * =========================
 * Admin Stats
 * =========================
 */
export interface UserStats {
  teacherCount: number;

  studentCount: number;

  courseCount: number;

  semesterCourseCount: number;

  semester: string | null;
}

/*
 * Backend 原始 Stats Response
 */
export interface UserStatsApiResponse {
  teacher_count: number;

  student_count: number;

  course_count: number;

  semester_course_count: number;

  semester: string | null;
}

/*
 * =========================
 * Admin Course
 * =========================
 */
export interface AdminCourse {
  id: number;

  name: string;

  description: string;

  semester: string;

  class_name: string;

  teacherId: number;
}

export interface AdminCourseListResponse {
  courses: AdminCourse[];
}

/*
 * =========================
 * Pending Student
 * =========================
 */
export interface PendingStudentItem {
  id: number;

  studentNo: string;

  name: string;

  email: string;

  applicationId: number;

  className: string | null;

  status: string;

  courseId: number | null;

  providerTeacherName: string | null;

  hasAccount: boolean;
}

/*
 * Backend 原始資料
 */
export interface PendingStudentApiItem {
  id: number;

  student_no: string;

  name: string;

  email: string;

  application_id: number;

  class_name: string | null;

  status: string;

  course_id: number | null;

  provider_teacher_name: string | null;

  has_account: boolean;
}

export interface PendingStudentListResponse {
  items: PendingStudentApiItem[];
}

/*
 * =========================
 * Student Approval
 * =========================
 */
export interface ApproveStudentsRequest {
  course_id: number;

  item_ids: number[];
}

export interface ApproveStudentsResponse {
  message: string;

  activated_count: number;

  created_count: number;

  enrolled_count: number;
}

export interface CourseActivationStudent {
  id: string | number;
  name: string;
  studentNo: string;
  email: string;
}
