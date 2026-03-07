import { apiRequest } from '../client';
import { CreateCommentRequest, CommentDto } from '../../types';

export const createPostComment = (
  courseId: string,
  postId: string,
  data: CreateCommentRequest
): Promise<CommentDto> => {
  return apiRequest<CommentDto>(`/courses/${courseId}/posts/${postId}/comments`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};
