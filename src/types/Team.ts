import { CourseCategoryDto } from './Category';
import { UserDto } from './User';

export interface CourseTeamMemberDto {
  user: UserDto;
  category: CourseCategoryDto | null;
}

export interface CourseTeamDto {
  id: string;
  name: string;
  createdAt: string;
  membersCount: number;
  members: CourseTeamMemberDto[];
  maxSize: number | null;
  selfEnrollmentEnabled: boolean;
  isFull: boolean;
  categories: CourseCategoryDto[];
  categoryId: string | null;
  categoryTitle: string | null;
}

export interface CreateCourseTeamRequest {
  name: string;
  memberIds?: string[];
  categoryIds?: string[];
}

export interface CourseTeamAvailabilityDto {
  id: string;
  name: string;
  currentMembers: number;
  maxSize: number | null;
  isFull: boolean;
  isStudentMember: boolean;
  categories: CourseCategoryDto[];
  createdAt: string;
}

export interface StudentTeamDto {
  teamId: string;
  teamName: string;
  membersCount: number;
  maxSize: number | null;
  members: CourseTeamMemberDto[];
  joinedAt: string;
}

export interface EnrollmentTeamStatusDto {
  teamId: string;
  teamName: string;
  currentMembers: number;
  maxSize: number | null;
}

export interface EnrollmentResponseDto {
  success: boolean;
  message: string;
  team: EnrollmentTeamStatusDto;
}
