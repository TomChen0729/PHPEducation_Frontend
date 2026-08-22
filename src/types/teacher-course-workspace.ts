export interface CourseWorkspaceInfo {
  id: number;

  name: string;

  description: string;

  semester: string;

  teacherName: string;
}

export interface CourseStudentMock {
  id: number;

  studentNo: string;

  name: string;

  email: string;

  status: 'pending' | 'active';
}

export interface CourseMaterialMock {
  id: number;

  name: string;

  status: 'draft' | 'published' | 'archived';

  topicCount: number;

  updatedAt: string;
}
