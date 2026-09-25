export type CourseStudentStatus = 'pending' | 'approved';

export interface CourseStudent {
  /*
   * student_application_items.id
   */
  id: number;

  student_no: string;

  name: string;

  email: string;

  application_id: number;

  class_name: string | null;

  status: CourseStudentStatus;

  course_id: number | null;

  provider_teacher_name: string | null;

  has_account: boolean;
}

/*
 * GET
 * /teacher/courses/{courseId}/student-applications
 */
export interface CourseStudentListResponse {
  items: CourseStudent[];
}

/*
 * 手動新增學生時的一筆資料。
 *
 * Backend：
 * student_no 必填
 * name / email 選填
 */
export interface CourseStudentInput {
  student_no: string;

  name?: string;

  email?: string;
}

/*
 * POST
 * /teacher/courses/{courseId}/student-applications
 */
export interface CreateCourseStudentsRequest {
  students: CourseStudentInput[];
}

/*
 * GET
 * /teacher/students/lookup
 */
export interface StudentLookupMatch {
  student_no: string;

  name: string;

  /*
   * Backend 預計新增欄位。
   * 已有帳號學生可直接帶入既有信箱。
   */
  email?: string | null;
}

export interface StudentLookupResponse {
  has_account: boolean;

  student_no: string | null;

  name: string | null;

  /*
   * Backend 預計新增欄位名稱：email
   */
  email?: string | null;

  matches: StudentLookupMatch[];
}

/*
 * PUT
 * /teacher/courses/{courseId}/student-applications/{itemId}
 */
export interface UpdateCourseStudentRequest {
  student_no: string;

  name: string;

  email?: string;
}

export interface UpdateCourseStudentResponse {
  message: string;

  item: CourseStudent;
}

/*
 * Backend 建立申請後回傳的 Application。
 */
export interface StudentApplication {
  id: number;

  tid: number;

  course_id: number;

  class_name: string;

  status: CourseStudentStatus;

  created_at?: string;

  updated_at?: string;
}

export interface StudentApplicationResponse {
  message: string;

  data: StudentApplication;
}

export interface RemoveCourseStudentResponse {
  message: string;
}
