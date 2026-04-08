import { apiRequestPreserveErrors } from '../client';
import { StudentTeamDto } from '../../types';

export const getMyTeam = (courseId: string, postId: string): Promise<StudentTeamDto> => {
  return apiRequestPreserveErrors<StudentTeamDto>(`/courses/${courseId}/posts/${postId}/my-team`);
};
