import { downloadFile } from '../client';

export const downloadPostMaterial = (
  courseId: string,
  postId: string,
  fileId: string
): Promise<Blob> => {
  return downloadFile(`/courses/${courseId}/posts/${postId}/materials/${fileId}/download`);
};
