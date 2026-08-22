export interface CourseActivationApplication {
  id: number;

  courseId: number;
  courseName: string;
  semester: string;

  teacherId: number;
  teacherName: string;

  studentCount: number;

  status: 'pending' | 'approved';
}

export interface CourseActivationStudent {
  id: number;

  studentNo: string;
  name: string;
  email: string;
}

export interface UserStats {
  teacherCount: number;
  studentCount: number;
  currentSemesterCourseCount: number;
}
