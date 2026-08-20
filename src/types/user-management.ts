export interface PendingStudentItem {
  id: number;

  studentNo: string;
  name: string;

  providerTeacherName: string;

  courseId: number;
  courseName: string;
  semester: string;
}

export interface CourseFilterOption {
  label: string;
  value: number;
}

export interface UserStats {
  teacherCount: number;
  studentCount: number;
  currentSemesterCourseCount: number;
}
