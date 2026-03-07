import { apiRequest } from '../client';
import { UserDto } from '../../types';

export const getCurrentUser = (): Promise<UserDto> => {
  return apiRequest<UserDto>('/auth/me');
};
