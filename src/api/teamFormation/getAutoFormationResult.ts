import { apiRequestPreserveErrors } from '../client';
import { AutoTeamFormationResultDto } from '../../types';

export const getAutoFormationResult = (
  courseId: string,
  postId: string
): Promise<AutoTeamFormationResultDto> => {
  return apiRequestPreserveErrors<AutoTeamFormationResultDto>(
    `/courses/${courseId}/posts/${postId}/team-formation/auto/result`
  );
};
