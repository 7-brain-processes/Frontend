import { apiRequestPreserveErrors } from '../client';
import { RespondToTeamInvitationRequest, TeamInvitationDto } from '../../types';

export const respondToTeamInvitation = (
  courseId: string,
  postId: string,
  invitationId: string,
  data: RespondToTeamInvitationRequest
): Promise<TeamInvitationDto> => {
  return apiRequestPreserveErrors<TeamInvitationDto>(
    `/courses/${courseId}/posts/${postId}/invitations/${invitationId}/respond`,
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  );
};
