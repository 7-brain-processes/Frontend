import { apiRequestPreserveErrors } from '../client';
import { EnrollmentResponseDto } from '../../types';

export const enrollInTeam = (
  courseId: string,
  postId: string,
  teamId: string
): Promise<EnrollmentResponseDto> => {
  return apiRequestPreserveErrors<EnrollmentResponseDto>(`/courses/${courseId}/posts/${postId}/teams/${teamId}/enroll`, {
    method: 'POST',
  });
};
