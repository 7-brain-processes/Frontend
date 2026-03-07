export type CourseRole = 'TEACHER' | 'STUDENT';
export type PostType = 'MATERIAL' | 'TASK';
export type SolutionStatus = 'SUBMITTED' | 'GRADED';

export interface RegisterRequest {
  username: string;
  password: string;
  displayName: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: UserDto;
}

export interface UserDto {
  id: string;
  username: string;
  displayName: string;
  createdAt: string;
}

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

export interface MemberDto {
  user: UserDto;
  role: CourseRole;
  joinedAt: string;
}

export interface PageMemberDto {
  content: MemberDto[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface InviteDto {
  id: string;
  code: string;
  role: CourseRole;
  expiresAt: string | null;
  maxUses: number | null;
  currentUses: number;
  createdAt: string;
}

export interface CreateInviteRequest {
  role: CourseRole;
  expiresInDays?: number;
  maxUses?: number;
}

export interface PostDto {
  id: string;
  title: string;
  content: string;
  type: PostType;
  deadline: string | null;
  author: UserDto;
  materialsCount: number;
  commentsCount: number;
  solutionsCount?: number;
  mySolutionId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostRequest {
  title: string;
  content?: string;
  type: PostType;
  deadline?: string;
}

export interface UpdatePostRequest {
  title?: string;
  content?: string;
  deadline?: string;
}

export interface PagePostDto {
  content: PostDto[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface FileDto {
  id: string;
  originalName: string;
  contentType: string;
  sizeBytes: number;
  uploadedAt: string;
}

export interface CommentDto {
  id: string;
  text: string;
  author: UserDto;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentRequest {
  text: string;
}

export interface PageCommentDto {
  content: CommentDto[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface SolutionDto {
  id: string;
  text: string;
  status: SolutionStatus;
  grade: number | null;
  filesCount: number;
  student: UserDto;
  submittedAt: string;
  updatedAt: string;
  gradedAt: string | null;
}

export interface CreateSolutionRequest {
  text?: string;
}

export interface PageSolutionDto {
  content: SolutionDto[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface GradeRequest {
  grade: number;
  comment?: string;
}

export interface ErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
}
