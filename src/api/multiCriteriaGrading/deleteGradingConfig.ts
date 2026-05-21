import { apiRequest } from '../client';

export const deleteGradingConfig = (courseId: string, postId: string): Promise<void> => {
  return apiRequest<void>(`/courses/${courseId}/posts/${postId}/grading-config`, {
    method: 'DELETE',
  });
};
