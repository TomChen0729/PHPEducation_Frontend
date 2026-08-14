export interface PendingStudentItem {
  id: number;
  studentNo: string;
  name: string;
  providerTeacherName: string;
}

export interface UserStats {
  teacherCount: number;
  studentCount: number;
  currentSemesterCourseCount: number;
}
