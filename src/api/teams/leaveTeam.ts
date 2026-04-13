import { apiRequestPreserveErrors } from '../client';
import { EnrollmentResponseDto } from '../../types';

export const leaveTeam = (
  courseId: string,
  postId: string,
  teamId: string
): Promise<EnrollmentResponseDto> => {
  return apiRequestPreserveErrors<EnrollmentResponseDto>(`/courses/${courseId}/posts/${postId}/teams/${teamId}/leave`, {
    method: 'DELETE',
  });
};
