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
  teacherName: string | null;
}

export interface AdminCourseApiItem {
  id: number;
  name: string;
  description: string;
  semester: string;
  class_name: string;
  teacher_id: number;
  teacher_name: string | null;
}

export interface AdminCourseListResponse {
  courses: AdminCourseApiItem[];
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
 * Course Activation
 * =========================
 *
 * 管理員改以「申請來源課程」為單位開通，
 * 後端會自動抓該來源課程全部 pending 學生，
 * 並可一次寫入一門或多門課程的 enrollments。
 */
export interface ApproveCoursesRequest {
  source_course_id: number;
  course_ids: number[];
}

export interface ApproveCoursesResponse {
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
