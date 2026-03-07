import { uploadFile } from '../client';
import { FileDto } from '../../types';

export const uploadPostMaterial = (courseId: string, postId: string, file: File): Promise<FileDto> => {
  const formData = new FormData();
  formData.append('file', file);
  return uploadFile<FileDto>(`/courses/${courseId}/posts/${postId}/materials`, formData);
};
