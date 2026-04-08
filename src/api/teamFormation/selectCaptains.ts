import { apiRequestPreserveErrors } from '../client';
import { CaptainDto, SelectCaptainsRequest } from '../../types';

export const selectCaptains = (
  courseId: string,
  postId: string,
  data: SelectCaptainsRequest = {}
): Promise<CaptainDto[]> => {
  return apiRequestPreserveErrors<CaptainDto[]>(
    `/courses/${courseId}/posts/${postId}/team-formation/captains/select`,
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  );
};
