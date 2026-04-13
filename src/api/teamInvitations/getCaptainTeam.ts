import { apiRequestPreserveErrors } from '../client';
import { CaptainTeamDto } from '../../types';

export const getCaptainTeam = (
  courseId: string,
  postId: string
): Promise<CaptainTeamDto> => {
  return apiRequestPreserveErrors<CaptainTeamDto>(
    `/courses/${courseId}/posts/${postId}/invitations/captain/team`
  );
};
