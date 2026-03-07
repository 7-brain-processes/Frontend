import { apiRequest, setAuthToken } from '../client';
import { LoginRequest, AuthResponse } from '../../types';

export const login = async (data: LoginRequest): Promise<AuthResponse> => {
  const response = await apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  setAuthToken(response.token);
  return response;
};
