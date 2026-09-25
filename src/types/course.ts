export interface Course {
  id: number;

  name: string;

  description: string;

  semester: string;

  class_name: string;

  teacher_id: number;
}

export interface CourseRequest {
  name: string;

  description: string;

  semester: string;

  class_name: string;

  /*
   * 建立新課程時可選擇從自己的既有課程深拷貝。
   * 編輯既有課程時不需要傳送這些欄位。
   */
  source_course_id?: number;

  copy_materials?: boolean;

  copy_questions?: boolean;
}

export interface CourseResponse {
  course: Course;
}

export interface CourseListResponse {
  courses: Course[];
}
