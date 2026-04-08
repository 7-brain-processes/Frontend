import { CourseCategoryDto } from './Category';
import { CourseRole } from './Course';
import { CourseTeamMemberDto } from './Team';

export interface AutoTeamFormationRequest {
  minTeamSize: number;
  maxTeamSize: number;
  balanceByCategory: boolean;
  balanceByRole: boolean;
  reshuffle?: boolean;
}

export interface AutoTeamFormationTeamDto {
  teamId: string;
  teamName: string;
  membersCount: number;
  maxSize: number | null;
  members?: CourseTeamMemberDto[];
}

export interface AutoTeamFormationResultDto {
  teamCount: number;
  assignedStudentsCount: number;
  unassignedStudentsCount: number;
  teams?: AutoTeamFormationTeamDto[];
}

export interface TeamFormationStudentDto {
  userId: string;
  username: string;
  displayName: string;
  role?: CourseRole;
  category?: CourseCategoryDto | null;
}

export interface SelectCaptainsRequest {
  reshuffle?: boolean;
}

export interface CaptainDto {
  userId: string;
  username: string;
  displayName: string;
  selectedAt?: string;
}
