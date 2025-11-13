// types/auth.types.ts
export type UserRole = 'admin' | 'organizer' | 'participant';

export interface User {
  _id: string;
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  isVerified: boolean;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface RegisterResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}