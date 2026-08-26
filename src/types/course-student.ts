export type CourseStudentStatus = 'pending' | 'approved';

export interface CourseStudent {
  /*
   * student_application_items.id
   *
   * 刪除時 Backend 使用的就是這個 id。
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
 */
export interface CourseStudentInput {
  student_no: string;

  name: string;
}

/*
 * POST
 * /teacher/courses/{courseId}/student-applications
 */
export interface CreateCourseStudentsRequest {
  students: CourseStudentInput[];
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
