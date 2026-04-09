//import { CourseCategoryDto } from './Category';
import { UserDto } from './User';

export interface CourseTeamMemberDto {
    user: UserDto;
    //category: CourseCategoryDto | null;
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
    //categories: CourseCategoryDto[];
    categoryId: string | null;
    categoryTitle: string | null;
}