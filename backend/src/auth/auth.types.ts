import type { User } from '../users/users.types';

export type { User } from '../users/users.types';
export type { StoredUser } from '../users/users.types';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export interface TokenPayload {
  sub: string;
  username: string;
  type: 'access' | 'refresh';
}
