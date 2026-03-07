export type CourseRole = 'TEACHER' | 'STUDENT';

export interface CourseDto {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  currentUserRole: CourseRole;
  teacherCount: number;
  studentCount: number;
}

export interface CreateCourseRequest {
  name: string;
  description?: string;
}

export interface UpdateCourseRequest {
  name?: string;
  description?: string;
}

export interface PageCourseDto {
  content: CourseDto[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
