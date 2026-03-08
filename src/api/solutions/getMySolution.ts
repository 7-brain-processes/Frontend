import { apiRequest } from '../client';
import { SolutionDto } from '../../types';

export const getMySolution = (courseId: string, postId: string): Promise<SolutionDto> => {
  return apiRequest<SolutionDto>(`/courses/${courseId}/posts/${postId}/solutions/my`);
};
