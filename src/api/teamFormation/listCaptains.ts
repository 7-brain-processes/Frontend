import { apiRequestPreserveErrors } from '../client';
import { CaptainDto } from '../../types';

export const listCaptains = (
  courseId: string,
  postId: string
): Promise<CaptainDto[]> => {
  return apiRequestPreserveErrors<CaptainDto[]>(
    `/courses/${courseId}/posts/${postId}/team-formation/captains`
  );
};
