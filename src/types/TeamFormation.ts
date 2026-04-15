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
  formedTeams: number;
  assignedStudents: number;
  unassignedStudents: number;
  generatedAt?: string;
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
  id?: string;
  userId: string;
  username: string;
  displayName: string;
}

export interface SelectCaptainsResultDto {
  selectedCaptains: number;
  captains: CaptainDto[];
  selectedAt: string;
}
