import { UserDto } from './User';
import { CourseRole } from './Course';
import { CourseCategoryDto } from './Category';

export interface MemberDto {
  user: UserDto;
  role: CourseRole;
  joinedAt: string;
  category?: CourseCategoryDto;
}

export interface PageMemberDto {
  content: MemberDto[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
