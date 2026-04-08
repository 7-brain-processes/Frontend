import { UserDto } from './User';
import { EnrollmentTeamStatusDto, CourseTeamMemberDto } from './Team';

export type TeamInvitationAction = 'accept' | 'decline';

export interface SendCaptainInvitationRequest {
  studentId: string;
}

export interface RespondToTeamInvitationRequest {
  action: TeamInvitationAction;
}

export interface CaptainTeamDto {
  teamId: string;
  teamName: string;
  membersCount: number;
  maxSize: number | null;
  members: CourseTeamMemberDto[];
}

export interface TeamInvitationDto {
  id: string;
  status: string;
  createdAt: string;
  respondedAt: string | null;
  captain: UserDto;
  student?: UserDto | null;
  team: EnrollmentTeamStatusDto;
}
