import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthResponse, AuthTokens } from './auth.types';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  const authResponse: AuthResponse = {
    user: {
      id: 'u-1',
      username: 'neo',
      firstName: '',
      lastName: '',
      email: 'neo@zion.dev',
      avatarUrl: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    tokens: {
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      expiresAt: new Date().toISOString(),
    },
  };

  const refreshResponse: AuthTokens = {
    accessToken: 'next-access-token',
    refreshToken: 'next-refresh-token',
    expiresAt: new Date().toISOString(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn().mockResolvedValue(authResponse),
            login: jest.fn().mockResolvedValue(authResponse),
            refresh: jest.fn().mockResolvedValue(refreshResponse),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  it('register delegates to auth service', async () => {
    const dto = {
      username: 'neo',
      email: 'neo@zion.dev',
      password: 'supersecure',
    };

    const result = await controller.register(dto);

    expect(authService.register.mock.calls[0]).toEqual([dto]);
    expect(result).toEqual(authResponse);
  });

  it('login delegates to auth service', async () => {
    const dto = {
      username: 'neo',
      password: 'supersecure',
    };

    const result = await controller.login(dto);

    expect(authService.login.mock.calls[0]).toEqual([dto]);
    expect(result).toEqual(authResponse);
  });

  it('refresh delegates to auth service', async () => {
    const dto = {
      refreshToken: 'refresh-token',
    };

    const result = await controller.refresh(dto);

    expect(authService.refresh.mock.calls[0]).toEqual([dto]);
    expect(result).toEqual(refreshResponse);
  });
});
