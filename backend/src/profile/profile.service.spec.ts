import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as argon2 from 'argon2';
import { UsersStore } from '../users/users-store.service';
import { StoredUser, User } from '../users/users.types';
import { ProfileService } from './profile.service';

jest.mock('argon2');

const mockArgon2 = argon2 as jest.Mocked<typeof argon2>;

const stored: StoredUser = {
  id: 'u-1',
  username: 'neo',
  firstName: 'Thomas',
  lastName: 'Anderson',
  email: 'neo@zion.dev',
  avatarUrl: null,
  passwordHash: 'hashed',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const publicUser: User = {
  id: stored.id,
  username: stored.username,
  firstName: stored.firstName,
  lastName: stored.lastName,
  email: stored.email,
  avatarUrl: stored.avatarUrl,
  createdAt: stored.createdAt,
  updatedAt: stored.updatedAt,
};

describe('ProfileService', () => {
  let service: ProfileService;
  let usersStore: jest.Mocked<UsersStore>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileService,
        {
          provide: UsersStore,
          useValue: {
            findById: jest.fn(),
            update: jest.fn(),
            toPublicUser: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProfileService>(ProfileService);
    usersStore = module.get(UsersStore);

    usersStore.findById.mockReturnValue(stored);
    usersStore.toPublicUser.mockReturnValue(publicUser);
    usersStore.update.mockReturnValue(stored);
  });

  describe('getProfile', () => {
    it('returns public user for known id', () => {
      const result = service.getProfile('u-1');
      expect(result).toEqual(publicUser);
    });

    it('throws NotFoundException for unknown id', () => {
      usersStore.findById.mockReturnValue(undefined);
      expect(() => service.getProfile('ghost')).toThrow(NotFoundException);
    });
  });

  describe('getPublicProfile', () => {
    it('returns only public fields (no email)', () => {
      const result = service.getPublicProfile('u-1');
      expect(result.id).toBe('u-1');
      expect(result.username).toBe('neo');
      expect((result as Record<string, unknown>).email).toBeUndefined();
    });

    it('throws NotFoundException for unknown id', () => {
      usersStore.findById.mockReturnValue(undefined);
      expect(() => service.getPublicProfile('ghost')).toThrow(NotFoundException);
    });
  });

  describe('updateProfile', () => {
    it('calls usersStore.update with provided fields and updatedAt', () => {
      service.updateProfile('u-1', { firstName: 'Thomas' });
      const [updatedId, payload] = usersStore.update.mock.calls[0] as [
        string,
        { firstName?: string; updatedAt?: string },
      ];
      expect(updatedId).toBe('u-1');
      expect(payload.firstName).toBe('Thomas');
      expect(typeof payload.updatedAt).toBe('string');
    });

    it('returns updated public user', () => {
      const result = service.updateProfile('u-1', { firstName: 'Thomas' });
      expect(result).toEqual(publicUser);
    });
  });

  describe('changePassword', () => {
    it('throws NotFoundException when user does not exist', async () => {
      usersStore.findById.mockReturnValue(undefined);
      await expect(service.changePassword('ghost', 'old', 'new')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws UnauthorizedException when current password is wrong', async () => {
      mockArgon2.verify.mockResolvedValue(false);
      await expect(service.changePassword('u-1', 'wrong', 'newpass')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('hashes new password and updates store when current password is correct', async () => {
      mockArgon2.verify.mockResolvedValue(true);
      mockArgon2.hash.mockResolvedValue('new-hash');
      await service.changePassword('u-1', 'correct', 'newpass');
      expect(usersStore.update.mock.calls).toContainEqual([
        'u-1',
        expect.objectContaining({ passwordHash: 'new-hash' }),
      ]);
    });
  });

  describe('updateAvatar', () => {
    it('sets avatarUrl to /uploads/avatars/<filename> and returns updated user', () => {
      const result = service.updateAvatar('u-1', 'u-1-123.png');
      expect(usersStore.update.mock.calls).toContainEqual([
        'u-1',
        expect.objectContaining({ avatarUrl: '/uploads/avatars/u-1-123.png' }),
      ]);
      expect(result).toEqual(publicUser);
    });

    it('throws NotFoundException for unknown user', () => {
      usersStore.findById.mockReturnValue(undefined);
      expect(() => service.updateAvatar('ghost', 'file.png')).toThrow(NotFoundException);
    });
  });

  describe('removeAvatar', () => {
    it('sets avatarUrl to null and returns updated user', () => {
      const result = service.removeAvatar('u-1');
      expect(usersStore.update.mock.calls).toContainEqual([
        'u-1',
        expect.objectContaining({ avatarUrl: null }),
      ]);
      expect(result).toEqual(publicUser);
    });

    it('throws NotFoundException for unknown user', () => {
      usersStore.findById.mockReturnValue(undefined);
      expect(() => service.removeAvatar('ghost')).toThrow(NotFoundException);
    });
  });
});
