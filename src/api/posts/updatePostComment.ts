import { apiRequest } from '../client';
import { CreateCommentRequest, CommentDto } from '../../types';

export const updatePostComment = (
  courseId: string,
  postId: string,
  commentId: string,
  data: CreateCommentRequest
): Promise<CommentDto> => {
  return apiRequest<CommentDto>(
    `/courses/${courseId}/posts/${postId}/comments/${commentId}`,
    {
      method: 'PUT',
      body: JSON.stringify(data),
    }
  );
};
