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
}

export interface CourseResponse {
  course: Course;
}

export interface CourseListResponse {
  courses: Course[];
}
