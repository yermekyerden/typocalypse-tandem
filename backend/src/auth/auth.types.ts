export interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

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

export interface StoredUser extends User {
  passwordHash: string;
}
