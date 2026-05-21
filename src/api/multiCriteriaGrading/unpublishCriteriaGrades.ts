import { apiRequest } from '../client';

export const unpublishCriteriaGrades = (courseId: string, postId: string): Promise<void> => {
  return apiRequest<void>(`/courses/${courseId}/posts/${postId}/criteria-grades/publish`, {
    method: 'DELETE',
  });
};
