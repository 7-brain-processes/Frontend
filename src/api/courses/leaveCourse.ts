import { apiRequest } from '../client';

export const leaveCourse = (courseId: string): Promise<void> => {
  return apiRequest<void>(`/courses/${courseId}/leave`, {
    method: 'POST',
  });
};