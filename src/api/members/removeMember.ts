import { apiRequest } from '../client';

export const removeMember = (courseId: string, userId: string): Promise<void> => {
  return apiRequest<void>(`/courses/${courseId}/members/${userId}`, {
    method: 'DELETE',
  });
};
