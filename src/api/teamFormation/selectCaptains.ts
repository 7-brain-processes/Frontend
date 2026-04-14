import { apiRequestPreserveErrors } from '../client';
import { SelectCaptainsRequest, SelectCaptainsResultDto } from '../../types';

export const selectCaptains = (
  courseId: string,
  postId: string,
  data: SelectCaptainsRequest = {}
): Promise<SelectCaptainsResultDto> => {
  return apiRequestPreserveErrors<SelectCaptainsResultDto>(
    `/courses/${courseId}/posts/${postId}/team-formation/captains/select`,
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  );
};
