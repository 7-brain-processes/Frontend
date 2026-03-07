import { downloadFile } from '../client';

export const downloadSolutionFile = (
  courseId: string,
  postId: string,
  solutionId: string,
  fileId: string
): Promise<Blob> => {
  return downloadFile(
    `/courses/${courseId}/posts/${postId}/solutions/${solutionId}/files/${fileId}/download`
  );
};
