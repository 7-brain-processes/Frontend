import { apiRequest } from '../client';
import { CreatePostRequest, PostDto } from '../../types';

export const createPost = (courseId: string, data: CreatePostRequest): Promise<PostDto> => {
  return apiRequest<PostDto>(`/courses/${courseId}/posts`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};
