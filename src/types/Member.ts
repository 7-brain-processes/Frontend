import { UserDto } from './User';
import { CourseRole } from './Course';

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
