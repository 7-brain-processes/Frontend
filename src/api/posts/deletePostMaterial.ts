import { apiRequest } from '../client';

export const deletePostMaterial = (courseId: string, postId: string, fileId: string): Promise<void> => {
  return apiRequest<void>(`/courses/${courseId}/posts/${postId}/materials/${fileId}`, {
    method: 'DELETE',
  });
};
