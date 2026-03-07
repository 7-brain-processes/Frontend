import { apiRequest } from '../client';

export const deleteSolutionComment = (
  courseId: string,
  postId: string,
  solutionId: string,
  commentId: string
): Promise<void> => {
  return apiRequest<void>(
    `/courses/${courseId}/posts/${postId}/solutions/${solutionId}/comments/${commentId}`,
    {
      method: 'DELETE',
    }
  );
};
