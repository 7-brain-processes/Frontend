import { apiRequestPreserveErrors } from '../client';
import { AutoTeamFormationRequest, AutoTeamFormationResultDto } from '../../types';

export const runAutoTeamFormation = (
  courseId: string,
  postId: string,
  data: AutoTeamFormationRequest
): Promise<AutoTeamFormationResultDto> => {
  return apiRequestPreserveErrors<AutoTeamFormationResultDto>(
    `/courses/${courseId}/posts/${postId}/team-formation/auto`,
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  );
};
