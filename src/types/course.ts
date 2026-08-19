export interface Course {
  id: number;
  name: string;
  description: string | null;
  semester: string;
}

export interface CreateCourseRequest {
  name: string;
  description?: string | null;
  semester: string;
}

export interface UpdateCourseRequest {
  name: string;
  description?: string | null;
  semester: string;
}

export interface CourseListResponse {
  courses: Course[];
}

export interface CourseResponse {
  course: Course;
}

export interface DeleteCourseResponse {
  message: string;
}
