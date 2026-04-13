import { apiRequestPreserveErrors } from '../client';
import { SendCaptainInvitationRequest, TeamInvitationDto } from '../../types';

export const sendCaptainInvitation = (
  courseId: string,
  postId: string,
  data: SendCaptainInvitationRequest
): Promise<TeamInvitationDto> => {
  return apiRequestPreserveErrors<TeamInvitationDto>(
    `/courses/${courseId}/posts/${postId}/invitations/captain/send`,
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  );
};
