import { apiRequest } from '../client';

export const deleteCourse = (courseId: string): Promise<void> => {
  return apiRequest<void>(`/courses/${courseId}`, {
    method: 'DELETE',
  });
};
