import { apiRequestPreserveErrors } from '../client';
import { CaptainTeamMemberDto } from '../../types';

export const getCaptainTeam = (
  courseId: string,
  postId: string
): Promise<CaptainTeamMemberDto[]> => {
  return apiRequestPreserveErrors<CaptainTeamMemberDto[]>(
    `/courses/${courseId}/posts/${postId}/invitations/captain/team`
  );
};
