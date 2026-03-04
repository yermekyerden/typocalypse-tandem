import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [JwtModule.register({})],
      providers: [AuthService],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('register returns user with defaults and tokens', async () => {
    const result = await service.register({
      username: 'neo',
      email: 'neo@zion.dev',
      password: 'supersecure',
    });

    expect(typeof result.user.id).toBe('string');
    expect(result.user.username).toBe('neo');
    expect(result.user.email).toBe('neo@zion.dev');
    expect(result.user.firstName).toBe('');
    expect(result.user.lastName).toBe('');
    expect(result.user.avatarUrl).toBeNull();
    expect(typeof result.user.createdAt).toBe('string');
    expect(typeof result.user.updatedAt).toBe('string');

    expect(typeof result.tokens.accessToken).toBe('string');
    expect(typeof result.tokens.refreshToken).toBe('string');
    expect(typeof result.tokens.expiresAt).toBe('string');
  });

  it('register throws 409 for duplicate username', async () => {
    await service.register({
      username: 'neo',
      email: 'neo@zion.dev',
      password: 'supersecure',
    });

    await expect(
      service.register({
        username: 'neo',
        email: 'trinity@zion.dev',
        password: 'supersecure',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('register throws 409 for duplicate email', async () => {
    await service.register({
      username: 'neo',
      email: 'neo@zion.dev',
      password: 'supersecure',
    });

    await expect(
      service.register({
        username: 'trinity',
        email: 'neo@zion.dev',
        password: 'supersecure',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('login throws 401 for wrong password', async () => {
    await service.register({
      username: 'neo',
      email: 'neo@zion.dev',
      password: 'supersecure',
    });

    await expect(
      service.login({
        username: 'neo',
        password: 'incorrect-password',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('refresh throws 401 when access token is passed instead of refresh token', async () => {
    const register = await service.register({
      username: 'neo',
      email: 'neo@zion.dev',
      password: 'supersecure',
    });

    await expect(
      service.refresh({
        refreshToken: register.tokens.accessToken,
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
