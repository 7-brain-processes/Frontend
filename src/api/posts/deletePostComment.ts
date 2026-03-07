import { apiRequest } from '../client';

export const deletePostComment = (
  courseId: string,
  postId: string,
  commentId: string
): Promise<void> => {
  return apiRequest<void>(`/courses/${courseId}/posts/${postId}/comments/${commentId}`, {
    method: 'DELETE',
  });
};
