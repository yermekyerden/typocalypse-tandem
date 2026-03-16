import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { User } from '../users/users.types';
import { ProfileController } from './profile.controller';
import { PublicProfile, ProfileService } from './profile.service';

const user: User = {
  id: 'u-1',
  username: 'neo',
  firstName: 'Thomas',
  lastName: 'Anderson',
  email: 'neo@zion.dev',
  avatarUrl: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const publicProfile: PublicProfile = {
  id: 'u-1',
  username: 'neo',
  firstName: 'Thomas',
  lastName: 'Anderson',
  avatarUrl: null,
};

describe('ProfileController', () => {
  let controller: ProfileController;
  let profileService: jest.Mocked<ProfileService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfileController],
      providers: [
        {
          provide: ProfileService,
          useValue: {
            getProfile: jest.fn().mockReturnValue(user),
            getPublicProfile: jest.fn().mockReturnValue(publicProfile),
            updateProfile: jest.fn().mockReturnValue(user),
            changePassword: jest.fn().mockResolvedValue(undefined),
            updateAvatar: jest.fn().mockReturnValue(user),
            removeAvatar: jest.fn().mockReturnValue(user),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ProfileController>(ProfileController);
    profileService = module.get(ProfileService);
  });

  it('getMe delegates to profileService.getProfile', () => {
    const result = controller.getMe(user);
    expect(profileService.getProfile.mock.calls[0]).toEqual(['u-1']);
    expect(result).toEqual(user);
  });

  it('updateMe delegates to profileService.updateProfile', () => {
    const dto = { firstName: 'Thomas' };
    const result = controller.updateMe(user, dto);
    expect(profileService.updateProfile.mock.calls[0]).toEqual(['u-1', dto]);
    expect(result).toEqual(user);
  });

  it('getPublicProfile delegates to profileService.getPublicProfile', () => {
    const result = controller.getPublicProfile('u-1');
    expect(profileService.getPublicProfile.mock.calls[0]).toEqual(['u-1']);
    expect(result).toEqual(publicProfile);
  });

  it('changePassword delegates to profileService.changePassword', async () => {
    const dto = { currentPassword: 'old', newPassword: 'new12345' };
    await controller.changePassword(user, dto);
    expect(profileService.changePassword.mock.calls[0]).toEqual(['u-1', 'old', 'new12345']);
  });

  it('uploadAvatar delegates to profileService.updateAvatar', () => {
    const file = { filename: 'u-1-123.png' } as Express.Multer.File;
    const result = controller.uploadAvatar(user, file);
    expect(profileService.updateAvatar.mock.calls[0]).toEqual(['u-1', 'u-1-123.png']);
    expect(result).toEqual(user);
  });

  it('removeAvatar delegates to profileService.removeAvatar', () => {
    const result = controller.removeAvatar(user);
    expect(profileService.removeAvatar.mock.calls[0]).toEqual(['u-1']);
    expect(result).toEqual(user);
  });
});
