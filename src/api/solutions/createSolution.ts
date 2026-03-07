import { apiRequest } from '../client';
import { CreateSolutionRequest, SolutionDto } from '../../types';

export const createSolution = (
  courseId: string,
  postId: string,
  data: CreateSolutionRequest
): Promise<SolutionDto> => {
  return apiRequest<SolutionDto>(`/courses/${courseId}/posts/${postId}/solutions`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};
