import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersStore } from './users-store.service';
import { StoredUser } from './users.types';

const makeUser = (overrides: Partial<StoredUser> = {}): StoredUser => ({
  id: 'u-1',
  username: 'neo',
  firstName: '',
  lastName: '',
  email: 'neo@zion.dev',
  avatarUrl: null,
  passwordHash: 'hash',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  ...overrides,
});

describe('UsersStore', () => {
  let store: UsersStore;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersStore],
    }).compile();

    store = module.get<UsersStore>(UsersStore);
  });

  it('create and findById return the stored user', () => {
    const user = makeUser();
    store.create(user);
    expect(store.findById('u-1')).toEqual(user);
  });

  it('findById returns undefined for unknown id', () => {
    expect(store.findById('unknown')).toBeUndefined();
  });

  it('findByUsername returns user after create', () => {
    const user = makeUser();
    store.create(user);
    expect(store.findByUsername('neo')).toEqual(user);
  });

  it('findByUsername returns undefined for unknown username', () => {
    expect(store.findByUsername('ghost')).toBeUndefined();
  });

  it('findByEmail returns user after create', () => {
    const user = makeUser();
    store.create(user);
    expect(store.findByEmail('neo@zion.dev')).toEqual(user);
  });

  it('findByEmail returns undefined for unknown email', () => {
    expect(store.findByEmail('ghost@zion.dev')).toBeUndefined();
  });

  it('hasUsername returns true after create', () => {
    store.create(makeUser());
    expect(store.hasUsername('neo')).toBe(true);
  });

  it('hasUsername returns false for unknown username', () => {
    expect(store.hasUsername('ghost')).toBe(false);
  });

  it('hasEmail returns true after create', () => {
    store.create(makeUser());
    expect(store.hasEmail('neo@zion.dev')).toBe(true);
  });

  it('hasEmail returns false for unknown email', () => {
    expect(store.hasEmail('ghost@zion.dev')).toBe(false);
  });

  it('update merges fields and returns updated user', () => {
    store.create(makeUser());
    const updated = store.update('u-1', { firstName: 'Thomas' });
    expect(updated.firstName).toBe('Thomas');
    expect(updated.username).toBe('neo');
  });

  it('update throws NotFoundException for unknown id', () => {
    expect(() => store.update('unknown', { firstName: 'X' })).toThrow(NotFoundException);
  });

  it('toPublicUser strips passwordHash', () => {
    const stored = makeUser();
    const pub = store.toPublicUser(stored);
    expect((pub as Record<string, unknown>).passwordHash).toBeUndefined();
    expect(pub.id).toBe('u-1');
    expect(pub.email).toBe('neo@zion.dev');
  });
});
