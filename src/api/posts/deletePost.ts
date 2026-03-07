import { apiRequest } from '../client';

export const deletePost = (courseId: string, postId: string): Promise<void> => {
  return apiRequest<void>(`/courses/${courseId}/posts/${postId}`, {
    method: 'DELETE',
  });
};
