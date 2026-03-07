import { apiRequest } from '../client';

export const revokeInvite = (courseId: string, inviteId: string): Promise<void> => {
  return apiRequest<void>(`/courses/${courseId}/invites/${inviteId}`, {
    method: 'DELETE',
  });
};
