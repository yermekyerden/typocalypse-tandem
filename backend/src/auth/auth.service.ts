import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { JwtSignOptions } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { randomUUID } from 'crypto';
import {
  DEFAULT_JWT_ACCESS_SECRET,
  DEFAULT_JWT_ACCESS_TTL,
  DEFAULT_JWT_REFRESH_SECRET,
  DEFAULT_JWT_REFRESH_TTL,
} from './auth.constants';
import { AuthResponse, AuthTokens, StoredUser, TokenPayload, User } from './auth.types';
import { LoginRequestDto } from './dto/login-request.dto';
import { RefreshRequestDto } from './dto/refresh-request.dto';
import { RegisterRequestDto } from './dto/register-request.dto';

@Injectable()
export class AuthService {
  private readonly accessSecret = process.env.JWT_ACCESS_SECRET ?? DEFAULT_JWT_ACCESS_SECRET;
  private readonly refreshSecret = process.env.JWT_REFRESH_SECRET ?? DEFAULT_JWT_REFRESH_SECRET;
  private readonly accessTtl = (process.env.JWT_ACCESS_TTL ??
    DEFAULT_JWT_ACCESS_TTL) as NonNullable<JwtSignOptions['expiresIn']>;
  private readonly refreshTtl = (process.env.JWT_REFRESH_TTL ??
    DEFAULT_JWT_REFRESH_TTL) as NonNullable<JwtSignOptions['expiresIn']>;

  private readonly usersById = new Map<string, StoredUser>();
  private readonly userIdByUsername = new Map<string, string>();
  private readonly userIdByEmail = new Map<string, string>();

  constructor(private readonly jwtService: JwtService) {}

  async register(dto: RegisterRequestDto): Promise<AuthResponse> {
    const username = dto.username.trim();
    const email = dto.email.trim().toLowerCase();

    if (this.userIdByUsername.has(username)) {
      throw new ConflictException('Username is already taken');
    }

    if (this.userIdByEmail.has(email)) {
      throw new ConflictException('Email is already taken');
    }

    const now = new Date().toISOString();
    const user: User = {
      id: randomUUID(),
      username,
      firstName: '',
      lastName: '',
      email,
      avatarUrl: null,
      createdAt: now,
      updatedAt: now,
    };

    const passwordHash = await argon2.hash(dto.password);
    const stored: StoredUser = {
      ...user,
      passwordHash,
    };

    this.usersById.set(stored.id, stored);
    this.userIdByUsername.set(username, stored.id);
    this.userIdByEmail.set(email, stored.id);

    return {
      user,
      tokens: await this.issueTokens(user),
    };
  }

  async login(dto: LoginRequestDto): Promise<AuthResponse> {
    const username = dto.username.trim();
    const userId = this.userIdByUsername.get(username);
    if (!userId) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const stored = this.usersById.get(userId);
    if (!stored) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await argon2.verify(stored.passwordHash, dto.password);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const user = this.toPublicUser(stored);
    return {
      user,
      tokens: await this.issueTokens(user),
    };
  }

  async refresh(dto: RefreshRequestDto): Promise<AuthTokens> {
    const payload = await this.verifyRefreshToken(dto.refreshToken);

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const stored = this.usersById.get(payload.sub);
    if (!stored) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return this.issueTokens(this.toPublicUser(stored));
  }

  private async issueTokens(user: User): Promise<AuthTokens> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: user.id,
          username: user.username,
          type: 'access',
        } satisfies TokenPayload,
        {
          secret: this.accessSecret,
          expiresIn: this.accessTtl,
        },
      ),
      this.jwtService.signAsync(
        {
          sub: user.id,
          username: user.username,
          type: 'refresh',
        } satisfies TokenPayload,
        {
          secret: this.refreshSecret,
          expiresIn: this.refreshTtl,
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
      expiresAt: this.extractExpiryIso(accessToken),
    };
  }

  private extractExpiryIso(accessToken: string): string {
    const decoded = this.jwtService.decode<{ exp?: number }>(accessToken);
    if (!decoded || typeof decoded.exp !== 'number') {
      throw new UnauthorizedException('Failed to issue access token');
    }

    return new Date(decoded.exp * 1000).toISOString();
  }

  private async verifyRefreshToken(token: string): Promise<TokenPayload> {
    try {
      return await this.jwtService.verifyAsync<TokenPayload>(token, {
        secret: this.refreshSecret,
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  private toPublicUser(stored: StoredUser): User {
    return {
      id: stored.id,
      username: stored.username,
      firstName: stored.firstName,
      lastName: stored.lastName,
      email: stored.email,
      avatarUrl: stored.avatarUrl,
      createdAt: stored.createdAt,
      updatedAt: stored.updatedAt,
    };
  }
}
