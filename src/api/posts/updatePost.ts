import { apiRequest } from '../client';
import { UpdatePostRequest, PostDto } from '../../types';

export const updatePost = (
  courseId: string,
  postId: string,
  data: UpdatePostRequest
): Promise<PostDto> => {
  return apiRequest<PostDto>(`/courses/${courseId}/posts/${postId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};
