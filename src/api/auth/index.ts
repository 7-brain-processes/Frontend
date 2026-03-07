import { register } from './register';
import { login } from './login';
import { getCurrentUser } from './getCurrentUser';

export { register } from './register';
export { login } from './login';
export { getCurrentUser } from './getCurrentUser';

export const authService = {
  register,
  login,
  getCurrentUser,
};
