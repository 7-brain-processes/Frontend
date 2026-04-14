import { UserDto } from './User';
import { EnrollmentTeamStatusDto } from './Team';
import { CourseCategoryDto } from './Category';

export type TeamInvitationAction = 'accept' | 'decline';

export interface SendCaptainInvitationRequest {
  studentId: string;
}

export interface RespondToTeamInvitationRequest {
  action: TeamInvitationAction;
}

export interface CaptainTeamMemberDto {
  userId: string;
  username: string;
  displayName: string;
  category?: CourseCategoryDto | null;
}

export interface TeamInvitationDto {
  id: string;
  status: string;
  createdAt: string;
  respondedAt: string | null;
  captain: UserDto;
  student?: UserDto | null;
  team?: EnrollmentTeamStatusDto | null;
}
