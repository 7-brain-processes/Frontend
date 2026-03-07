import { apiRequest } from '../client';

export const deleteSolution = (courseId: string, postId: string, solutionId: string): Promise<void> => {
  return apiRequest<void>(`/courses/${courseId}/posts/${postId}/solutions/${solutionId}`, {
    method: 'DELETE',
  });
};
