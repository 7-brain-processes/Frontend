import { apiRequest } from '../client';
import { FileDto } from '../../types';

export const listSolutionFiles = (
  courseId: string,
  postId: string,
  solutionId: string
): Promise<FileDto[]> => {
  return apiRequest<FileDto[]>(
    `/courses/${courseId}/posts/${postId}/solutions/${solutionId}/files`
  );
};
