import { apiRequest } from '../client';
import { CreateSolutionRequest, SolutionDto } from '../../types';

export const updateSolution = (
  courseId: string,
  postId: string,
  solutionId: string,
  data: CreateSolutionRequest
): Promise<SolutionDto> => {
  return apiRequest<SolutionDto>(
    `/courses/${courseId}/posts/${postId}/solutions/${solutionId}`,
    {
      method: 'PUT',
      body: JSON.stringify(data),
    }
  );
};
