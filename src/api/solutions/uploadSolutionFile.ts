import { uploadFile } from '../client';
import { FileDto } from '../../types';

export const uploadSolutionFile = (
  courseId: string,
  postId: string,
  solutionId: string,
  file: File
): Promise<FileDto> => {
  const formData = new FormData();
  formData.append('file', file);
  return uploadFile<FileDto>(
    `/courses/${courseId}/posts/${postId}/solutions/${solutionId}/files`,
    formData
  );
};
