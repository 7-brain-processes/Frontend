import { apiRequest } from '../client';
import { InviteDto } from '../../types';

export const listInvites = (courseId: string): Promise<InviteDto[]> => {
  return apiRequest<InviteDto[]>(`/courses/${courseId}/invites`);
};
