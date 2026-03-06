import { Injectable, NotFoundException } from '@nestjs/common';
import { StoredUser, User } from './users.types';

@Injectable()
export class UsersStore {
  private readonly usersById = new Map<string, StoredUser>();
  private readonly userIdByUsername = new Map<string, string>();
  private readonly userIdByEmail = new Map<string, string>();

  findById(id: string): StoredUser | undefined {
    return this.usersById.get(id);
  }

  findByUsername(username: string): StoredUser | undefined {
    const id = this.userIdByUsername.get(username);
    return id ? this.usersById.get(id) : undefined;
  }

  findByEmail(email: string): StoredUser | undefined {
    const id = this.userIdByEmail.get(email);
    return id ? this.usersById.get(id) : undefined;
  }

  hasUsername(username: string): boolean {
    return this.userIdByUsername.has(username);
  }

  hasEmail(email: string): boolean {
    return this.userIdByEmail.has(email);
  }

  create(user: StoredUser): StoredUser {
    this.usersById.set(user.id, user);
    this.userIdByUsername.set(user.username, user.id);
    this.userIdByEmail.set(user.email, user.id);
    return user;
  }

  update(id: string, fields: Partial<Omit<StoredUser, 'id'>>): StoredUser {
    const existing = this.usersById.get(id);
    if (!existing) {
      throw new NotFoundException('User not found');
    }

    const updated: StoredUser = { ...existing, ...fields, id };
    this.usersById.set(id, updated);

    if (fields.username && fields.username !== existing.username) {
      this.userIdByUsername.delete(existing.username);
      this.userIdByUsername.set(fields.username, id);
    }

    if (fields.email && fields.email !== existing.email) {
      this.userIdByEmail.delete(existing.email);
      this.userIdByEmail.set(fields.email, id);
    }

    return updated;
  }

  toPublicUser(stored: StoredUser): User {
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
