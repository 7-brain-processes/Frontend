import { apiRequestPreserveErrors } from '../client';
import { TeamInvitationDto } from '../../types';

export const listStudentInvitations = (
  courseId: string,
  postId: string
): Promise<TeamInvitationDto[]> => {
  return apiRequestPreserveErrors<TeamInvitationDto[]>(
    `/courses/${courseId}/posts/${postId}/invitations/student`
  );
};
