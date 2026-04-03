import {
  vfsResolve,
  vfsList,
  vfsRead,
  vfsMkdir,
  vfsTouch,
  vfsWriteFile,
  vfsRemoveFile,
  vfsChmod,
} from './vfs.service';
import { VfsDirNode, VfsFileNode, VfsSnapshot } from '../engine.types';

function expectVfsSuccess(result: ReturnType<typeof vfsMkdir>): VfsSnapshot {
  expect('root' in result).toBe(true);
  if (!('root' in result)) {
    throw new Error(`Expected VFS success, got: ${result.type}`);
  }
  return result;
}

function expectVfsError(result: ReturnType<typeof vfsMkdir>) {
  expect('root' in result).toBe(false);
  if ('root' in result) {
    throw new Error('Expected VFS error, got a snapshot result.');
  }
  return result;
}

function expectListResult(result: ReturnType<typeof vfsList>) {
  expect(Array.isArray(result)).toBe(true);
  if (!Array.isArray(result)) {
    throw new Error(`Expected directory listing, got: ${result.type}`);
  }
  return result;
}

function expectListError(result: ReturnType<typeof vfsList>) {
  expect(Array.isArray(result)).toBe(false);
  if (Array.isArray(result)) {
    throw new Error(`Expected list error, got ${result.length} entries.`);
  }
  return result;
}

function expectReadError(result: ReturnType<typeof vfsRead>) {
  expect(typeof result).not.toBe('string');
  if (typeof result === 'string') {
    throw new Error(`Expected read error, got content: ${result}`);
  }
  return result;
}

function makeSnapshot(): VfsSnapshot {
  return {
    root: {
      type: 'dir',
      name: '',
      children: [
        {
          type: 'dir',
          name: 'home',
          children: [
            {
              type: 'dir',
              name: 'dojo',
              children: [{ type: 'file', name: 'readme.txt', content: 'hello\n' }],
            },
          ],
        },
      ],
    },
  };
}

describe('VfsService', () => {
  describe('vfsResolve', () => {
    it('resolves root', () => {
      const node = vfsResolve(makeSnapshot(), '/');
      expect(node?.type).toBe('dir');
      expect(node?.name).toBe('');
    });

    it('resolves existing file', () => {
      const node = vfsResolve(makeSnapshot(), '/home/dojo/readme.txt');
      expect(node?.type).toBe('file');
    });

    it('returns null for missing path', () => {
      expect(vfsResolve(makeSnapshot(), '/home/dojo/missing.txt')).toBeNull();
    });
  });

  describe('vfsList', () => {
    it('lists children of a directory', () => {
      const result = expectListResult(vfsList(makeSnapshot(), '/home/dojo'));

      expect(result.map((n) => n.name)).toContain('readme.txt');
    });

    it('returns error for missing path', () => {
      const result = expectListError(vfsList(makeSnapshot(), '/nonexistent'));

      expect(result.type).toBe('path_not_found');
    });

    it('returns error for file path', () => {
      const result = expectListError(vfsList(makeSnapshot(), '/home/dojo/readme.txt'));

      expect(result.type).toBe('not_a_directory');
    });
  });

  describe('vfsRead', () => {
    it('reads file content', () => {
      expect(vfsRead(makeSnapshot(), '/home/dojo/readme.txt')).toBe('hello\n');
    });

    it('returns error for directory', () => {
      const result = expectReadError(vfsRead(makeSnapshot(), '/home/dojo'));

      expect(result.type).toBe('is_a_directory');
    });

    it('returns error for missing path', () => {
      const result = expectReadError(vfsRead(makeSnapshot(), '/home/dojo/nope.txt'));

      expect(result.type).toBe('path_not_found');
    });
  });

  describe('vfsMkdir', () => {
    it('creates a new directory', () => {
      const result = expectVfsSuccess(vfsMkdir(makeSnapshot(), '/home/dojo/projects'));

      expect(vfsResolve(result, '/home/dojo/projects')?.type).toBe('dir');
    });

    it('returns error when parent does not exist', () => {
      const result = expectVfsError(vfsMkdir(makeSnapshot(), '/home/ghost/projects'));

      expect(result.type).toBe('path_not_found');
    });

    it('returns error when path already exists', () => {
      const result = expectVfsError(vfsMkdir(makeSnapshot(), '/home/dojo'));

      expect(result.type).toBe('path_not_found');
    });

    it('enforces maxNodes budget', () => {
      const snapshot: VfsSnapshot = {
        ...makeSnapshot(),
        budgets: { maxNodes: 3, maxDepth: 10, maxFileBytes: 65536 },
      };
      const result = vfsMkdir(snapshot, '/home/dojo/projects');

      expect('root' in result).toBe(false);
      expect(result.type).toBe('budget_exceeded');
      expect(result.budget).toBe('max_vfs_nodes');
    });
  });

  describe('vfsTouch', () => {
    it('creates a new empty file', () => {
      const result = expectVfsSuccess(vfsTouch(makeSnapshot(), '/home/dojo/newfile.txt'));

      expect(vfsResolve(result, '/home/dojo/newfile.txt')?.type).toBe('file');
    });

    it('is a no-op for existing file', () => {
      const snap = makeSnapshot();
      const result = vfsTouch(snap, '/home/dojo/readme.txt');
      expect(result).toBe(snap);
    });

    it('returns error for existing directory', () => {
      const result = expectVfsError(vfsTouch(makeSnapshot(), '/home/dojo'));

      expect(result.type).toBe('is_a_directory');
    });
  });

  describe('vfsWriteFile', () => {
    it('overwrites existing file', () => {
      const result = expectVfsSuccess(
        vfsWriteFile(makeSnapshot(), '/home/dojo/readme.txt', 'new content', false),
      );

      expect(vfsRead(result, '/home/dojo/readme.txt')).toBe('new content');
    });

    it('appends to existing file', () => {
      const result = expectVfsSuccess(
        vfsWriteFile(makeSnapshot(), '/home/dojo/readme.txt', 'appended', true),
      );

      expect(vfsRead(result, '/home/dojo/readme.txt')).toBe('hello\nappended');
    });

    it('creates file if it does not exist', () => {
      const result = expectVfsSuccess(
        vfsWriteFile(makeSnapshot(), '/home/dojo/new.txt', 'created', false),
      );

      expect(vfsRead(result, '/home/dojo/new.txt')).toBe('created');
    });

    it('enforces maxFileBytes budget', () => {
      const snapshot: VfsSnapshot = {
        ...makeSnapshot(),
        budgets: { maxNodes: 200, maxDepth: 10, maxFileBytes: 5 },
      };
      const result = expectVfsError(
        vfsWriteFile(snapshot, '/home/dojo/readme.txt', 'way too long content', false),
      );

      expect(result.type).toBe('budget_exceeded');
      expect(result.budget).toBe('max_file_bytes');
    });
  });

  describe('permissions defaults', () => {
    it('vfsMkdir creates directory with default permissions "755"', () => {
      const result = expectVfsSuccess(vfsMkdir(makeSnapshot(), '/home/dojo/projects'));
      const node = vfsResolve(result, '/home/dojo/projects') as VfsDirNode;

      expect(node.permissions).toBe('755');
    });

    it('vfsTouch creates file with default permissions "644"', () => {
      const result = expectVfsSuccess(vfsTouch(makeSnapshot(), '/home/dojo/newfile.txt'));
      const node = vfsResolve(result, '/home/dojo/newfile.txt') as VfsFileNode;

      expect(node.permissions).toBe('644');
    });

    it('vfsWriteFile creates new file with default permissions "644"', () => {
      const result = expectVfsSuccess(
        vfsWriteFile(makeSnapshot(), '/home/dojo/new.txt', 'hello', false),
      );
      const node = vfsResolve(result, '/home/dojo/new.txt') as VfsFileNode;

      expect(node.permissions).toBe('644');
    });

    it('vfsWriteFile overwrites preserve existing permissions', () => {
      const snap: VfsSnapshot = {
        root: {
          type: 'dir',
          name: '',
          children: [
            {
              type: 'dir',
              name: 'home',
              children: [
                {
                  type: 'dir',
                  name: 'dojo',
                  children: [
                    {
                      type: 'file',
                      name: 'readme.txt',
                      content: 'hello\n',
                      permissions: '600',
                    },
                  ],
                },
              ],
            },
          ],
        },
      };
      const result = expectVfsSuccess(
        vfsWriteFile(snap, '/home/dojo/readme.txt', 'new content', false),
      );
      const node = vfsResolve(result, '/home/dojo/readme.txt') as VfsFileNode;

      expect(node.permissions).toBe('600');
    });
  });

  describe('vfsChmod', () => {
    it('sets permissions on an existing file', () => {
      const result = expectVfsSuccess(vfsChmod(makeSnapshot(), '/home/dojo/readme.txt', '600'));
      const node = vfsResolve(result, '/home/dojo/readme.txt') as VfsFileNode;

      expect(node.permissions).toBe('600');
    });

    it('sets permissions on a directory', () => {
      const result = expectVfsSuccess(vfsChmod(makeSnapshot(), '/home/dojo', '700'));
      const node = vfsResolve(result, '/home/dojo') as VfsDirNode;

      expect(node.permissions).toBe('700');
    });

    it('returns invalid_arguments for non-octal mode string', () => {
      const result = vfsChmod(makeSnapshot(), '/home/dojo/readme.txt', 'abc');

      expect('root' in result).toBe(false);
      if ('root' in result) throw new Error('Expected error');
      expect(result.type).toBe('invalid_arguments');
    });

    it('returns path_not_found for missing path', () => {
      const result = vfsChmod(makeSnapshot(), '/home/dojo/ghost.txt', '644');

      expect('root' in result).toBe(false);
      if ('root' in result) throw new Error('Expected error');
      expect(result.type).toBe('path_not_found');
    });
  });

  describe('vfsRemoveFile', () => {
    it('removes an existing file', () => {
      const result = expectVfsSuccess(vfsRemoveFile(makeSnapshot(), '/home/dojo/readme.txt'));

      expect(vfsResolve(result, '/home/dojo/readme.txt')).toBeNull();
    });

    it('returns error for missing path', () => {
      const result = expectVfsError(vfsRemoveFile(makeSnapshot(), '/home/dojo/ghost.txt'));

      expect(result.type).toBe('path_not_found');
    });

    it('returns error for directory', () => {
      const result = expectVfsError(vfsRemoveFile(makeSnapshot(), '/home/dojo'));

      expect(result.type).toBe('is_a_directory');
    });
  });
});
