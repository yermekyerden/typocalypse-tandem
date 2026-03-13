import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { existsSync, unlinkSync } from 'fs';
import { join } from 'path';
import { UsersStore } from '../users/users-store.service';
import { User } from '../users/users.types';

export interface PublicProfile {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
}

@Injectable()
export class ProfileService {
  constructor(private readonly usersStore: UsersStore) {}

  getProfile(userId: string): User {
    const stored = this.usersStore.findById(userId);
    if (!stored) {
      throw new NotFoundException('User not found');
    }
    return this.usersStore.toPublicUser(stored);
  }

  getPublicProfile(userId: string): PublicProfile {
    const stored = this.usersStore.findById(userId);
    if (!stored) {
      throw new NotFoundException('User not found');
    }
    return {
      id: stored.id,
      username: stored.username,
      firstName: stored.firstName,
      lastName: stored.lastName,
      avatarUrl: stored.avatarUrl,
    };
  }

  updateProfile(userId: string, fields: { firstName?: string; lastName?: string }): User {
    const updated = this.usersStore.update(userId, {
      ...fields,
      updatedAt: new Date().toISOString(),
    });
    return this.usersStore.toPublicUser(updated);
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const stored = this.usersStore.findById(userId);
    if (!stored) {
      throw new NotFoundException('User not found');
    }

    const isValid = await argon2.verify(stored.passwordHash, currentPassword);
    if (!isValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const passwordHash = await argon2.hash(newPassword);
    this.usersStore.update(userId, {
      passwordHash,
      updatedAt: new Date().toISOString(),
    });
  }

  updateAvatar(userId: string, filename: string): User {
    const stored = this.usersStore.findById(userId);
    if (!stored) {
      throw new NotFoundException('User not found');
    }

    if (stored.avatarUrl) {
      this.deleteAvatarFile(stored.avatarUrl);
    }

    const avatarUrl = `/uploads/avatars/${filename}`;
    const updated = this.usersStore.update(userId, {
      avatarUrl,
      updatedAt: new Date().toISOString(),
    });
    return this.usersStore.toPublicUser(updated);
  }

  removeAvatar(userId: string): User {
    const stored = this.usersStore.findById(userId);
    if (!stored) {
      throw new NotFoundException('User not found');
    }

    if (stored.avatarUrl) {
      this.deleteAvatarFile(stored.avatarUrl);
    }

    const updated = this.usersStore.update(userId, {
      avatarUrl: null,
      updatedAt: new Date().toISOString(),
    });
    return this.usersStore.toPublicUser(updated);
  }

  private deleteAvatarFile(avatarUrl: string): void {
    const relativePath = avatarUrl.startsWith('/') ? avatarUrl.slice(1) : avatarUrl;
    const absolutePath = join(process.cwd(), relativePath);
    if (existsSync(absolutePath)) {
      unlinkSync(absolutePath);
    }
  }
}
