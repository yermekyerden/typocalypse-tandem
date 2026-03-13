import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersStore } from '../../users/users-store.service';
import { StoredUser } from '../../users/users.types';
import { JwtAuthGuard } from './jwt-auth.guard';

const storedUser: StoredUser = {
  id: 'u-1',
  username: 'neo',
  firstName: '',
  lastName: '',
  email: 'neo@zion.dev',
  avatarUrl: null,
  passwordHash: 'hash',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

function makeContext(authHeader?: string): ExecutionContext {
  const request = {
    headers: authHeader ? { authorization: authHeader } : {},
    user: undefined as unknown,
  };
  return {
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let jwtService: jest.Mocked<JwtService>;
  let usersStore: jest.Mocked<UsersStore>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        {
          provide: JwtService,
          useValue: { verifyAsync: jest.fn() },
        },
        {
          provide: UsersStore,
          useValue: {
            findById: jest.fn(),
            toPublicUser: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
    jwtService = module.get(JwtService);
    usersStore = module.get(UsersStore);
  });

  it('returns true and attaches user for valid access token', async () => {
    jwtService.verifyAsync.mockResolvedValue({ sub: 'u-1', username: 'neo', type: 'access' });
    usersStore.findById.mockReturnValue(storedUser);
    usersStore.toPublicUser.mockReturnValue({ ...storedUser });

    const ctx = makeContext('Bearer valid.token.here');
    const result = await guard.canActivate(ctx);

    expect(result).toBe(true);
    expect(usersStore.findById.mock.calls[0]).toEqual(['u-1']);
  });

  it('throws 401 when Authorization header is missing', async () => {
    await expect(guard.canActivate(makeContext())).rejects.toThrow(UnauthorizedException);
  });

  it('throws 401 when token is malformed (verifyAsync throws)', async () => {
    jwtService.verifyAsync.mockRejectedValue(new Error('invalid'));
    await expect(guard.canActivate(makeContext('Bearer bad.token'))).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('throws 401 when token type is refresh instead of access', async () => {
    jwtService.verifyAsync.mockResolvedValue({ sub: 'u-1', username: 'neo', type: 'refresh' });
    await expect(guard.canActivate(makeContext('Bearer valid.token.here'))).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('throws 401 when user id from payload does not exist in store', async () => {
    jwtService.verifyAsync.mockResolvedValue({ sub: 'ghost', username: 'ghost', type: 'access' });
    usersStore.findById.mockReturnValue(undefined);
    await expect(guard.canActivate(makeContext('Bearer valid.token.here'))).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('throws 401 when Authorization scheme is not Bearer', async () => {
    await expect(guard.canActivate(makeContext('Basic dXNlcjpwYXNz'))).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
