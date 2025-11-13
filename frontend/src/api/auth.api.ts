import api from './axios';
import type { LoginResponse, RegisterResponse, User } from '../types/auth.types';

export const loginAPI = (payload: { email: string; password: string }): Promise<LoginResponse> =>
  api.post('/auth/login', payload).then((r) => r.data);

export const registerAPI = (payload: {
  name: string;
  email: string;
  password: string;
  role?: string;
}): Promise<RegisterResponse> =>
  api.post('/auth/register', payload).then((r) => r.data);

export const meAPI = (): Promise<{ user: User }> =>
  api.get('/auth/me').then((r) => r.data);

export const refreshTokenAPI = (refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> =>
  api.post('/auth/refresh', { refreshToken }).then((r) => r.data);
