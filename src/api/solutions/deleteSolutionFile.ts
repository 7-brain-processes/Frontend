import { apiRequest } from '../client';

export const deleteSolutionFile = (
  courseId: string,
  postId: string,
  solutionId: string,
  fileId: string
): Promise<void> => {
  return apiRequest<void>(
    `/courses/${courseId}/posts/${postId}/solutions/${solutionId}/files/${fileId}`,
    {
      method: 'DELETE',
    }
  );
};
