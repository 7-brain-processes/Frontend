import { apiRequest } from '../client';
import { CreateCommentRequest, CommentDto } from '../../types';

export const createSolutionComment = (
  courseId: string,
  postId: string,
  solutionId: string,
  data: CreateCommentRequest
): Promise<CommentDto> => {
  return apiRequest<CommentDto>(
    `/courses/${courseId}/posts/${postId}/solutions/${solutionId}/comments`,
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  );
};
