export interface TeacherCourse {
  id: number;

  name: string;

  description: string;

  semester: string;

  teacher_id: number;
}

export interface TeacherCourseRequest {
  name: string;

  description: string;

  semester: string;
}

export interface TeacherCourseResponse {
  course: TeacherCourse;
}

export interface TeacherCourseListResponse {
  courses: TeacherCourse[];
}

/*
 * =========================
 * Student MOCK
 * =========================
 */
export interface CourseStudentMock {
  id: number;

  studentNo: string;

  name: string;

  email: string;

  status: 'pending' | 'active';
}
