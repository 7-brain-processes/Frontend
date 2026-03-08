import { apiRequest } from '../client';
import { GradeRequest, SolutionDto } from '../../types';

export const gradeSolution = (
  courseId: string,
  postId: string,
  solutionId: string,
  data: GradeRequest
): Promise<SolutionDto> => {
  return apiRequest<SolutionDto>(
    `/courses/${courseId}/posts/${postId}/solutions/${solutionId}/grade`,
    {
      method: 'PUT',
      body: JSON.stringify(data),
    }
  );
};
