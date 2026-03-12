import { apiRequest } from '../client';
import { SolutionDto } from '../../types';

export const removeGrade = (
  courseId: string,
  postId: string,
  solutionId: string
): Promise<SolutionDto> => {
  return apiRequest<SolutionDto>(
    `/courses/${courseId}/posts/${postId}/solutions/${solutionId}/grade`,
    {
      method: 'DELETE',
    }
  );
};
