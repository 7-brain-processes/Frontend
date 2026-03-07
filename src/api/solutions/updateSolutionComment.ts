import { apiRequest } from '../client';
import { CreateCommentRequest, CommentDto } from '../../types';

export const updateSolutionComment = (
  courseId: string,
  postId: string,
  solutionId: string,
  commentId: string,
  data: CreateCommentRequest
): Promise<CommentDto> => {
  return apiRequest<CommentDto>(
    `/courses/${courseId}/posts/${postId}/solutions/${solutionId}/comments/${commentId}`,
    {
      method: 'PUT',
      body: JSON.stringify(data),
    }
  );
};
