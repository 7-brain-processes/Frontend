import { apiRequest } from '../client';
import { CreateInviteRequest, InviteDto } from '../../types';

export const createInvite = (courseId: string, data: CreateInviteRequest): Promise<InviteDto> => {
  return apiRequest<InviteDto>(`/courses/${courseId}/invites`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};
