import { apiRequest } from '../client';
import { FileDto } from '../../types';

export const listPostMaterials = (courseId: string, postId: string): Promise<FileDto[]> => {
  return apiRequest<FileDto[]>(`/courses/${courseId}/posts/${postId}/materials`);
};
