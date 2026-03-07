import { apiRequest } from '../client';
import { PostDto } from '../../types';

export const getPost = (courseId: string, postId: string): Promise<PostDto> => {
  return apiRequest<PostDto>(`/courses/${courseId}/posts/${postId}`);
};
