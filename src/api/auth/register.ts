import { apiRequest, setAuthToken } from '../client';
import { RegisterRequest, AuthResponse } from '../../types';

export const register = async (data: RegisterRequest): Promise<AuthResponse> => {
  const response = await apiRequest<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  setAuthToken(response.token);
  return response;
};
