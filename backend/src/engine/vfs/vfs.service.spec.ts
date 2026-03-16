import {
  vfsResolve,
  vfsList,
  vfsRead,
  vfsMkdir,
  vfsTouch,
  vfsWriteFile,
  vfsRemoveFile,
} from './vfs.service';
import { VfsSnapshot } from '../engine.types';

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
      const result = vfsList(makeSnapshot(), '/home/dojo');
      expect(Array.isArray(result)).toBe(true);
      if (!Array.isArray(result)) return;
      expect(result.map((n) => n.name)).toContain('readme.txt');
    });

    it('returns error for missing path', () => {
      const result = vfsList(makeSnapshot(), '/nonexistent');
      expect(Array.isArray(result)).toBe(false);
      if (Array.isArray(result)) return;
      expect(result.type).toBe('path_not_found');
    });

    it('returns error for file path', () => {
      const result = vfsList(makeSnapshot(), '/home/dojo/readme.txt');
      expect(Array.isArray(result)).toBe(false);
      if (Array.isArray(result)) return;
      expect(result.type).toBe('not_a_directory');
    });
  });

  describe('vfsRead', () => {
    it('reads file content', () => {
      expect(vfsRead(makeSnapshot(), '/home/dojo/readme.txt')).toBe('hello\n');
    });

    it('returns error for directory', () => {
      const result = vfsRead(makeSnapshot(), '/home/dojo');
      expect(typeof result).not.toBe('string');
      if (typeof result === 'string') return;
      expect(result.type).toBe('is_a_directory');
    });

    it('returns error for missing path', () => {
      const result = vfsRead(makeSnapshot(), '/home/dojo/nope.txt');
      expect(typeof result).not.toBe('string');
      if (typeof result === 'string') return;
      expect(result.type).toBe('path_not_found');
    });
  });

  describe('vfsMkdir', () => {
    it('creates a new directory', () => {
      const result = vfsMkdir(makeSnapshot(), '/home/dojo/projects');
      expect('root' in result).toBe(true);
      if (!('root' in result)) return;
      expect(vfsResolve(result, '/home/dojo/projects')?.type).toBe('dir');
    });

    it('returns error when parent does not exist', () => {
      const result = vfsMkdir(makeSnapshot(), '/home/ghost/projects');
      expect('root' in result).toBe(false);
      if ('root' in result) return;
      expect(result.type).toBe('path_not_found');
    });

    it('returns error when path already exists', () => {
      const result = vfsMkdir(makeSnapshot(), '/home/dojo');
      expect('root' in result).toBe(false);
    });

    it('enforces maxNodes budget', () => {
      const snapshot: VfsSnapshot = {
        ...makeSnapshot(),
        budgets: { maxNodes: 3, maxDepth: 10, maxFileBytes: 65536 },
      };
      const result = vfsMkdir(snapshot, '/home/dojo/projects');
      expect('root' in result).toBe(false);
      if ('root' in result) return;
      expect(result.type).toBe('budget_exceeded');
      expect(result.budget).toBe('max_vfs_nodes');
    });
  });

  describe('vfsTouch', () => {
    it('creates a new empty file', () => {
      const result = vfsTouch(makeSnapshot(), '/home/dojo/newfile.txt');
      expect('root' in result).toBe(true);
      if (!('root' in result)) return;
      expect(vfsResolve(result, '/home/dojo/newfile.txt')?.type).toBe('file');
    });

    it('is a no-op for existing file', () => {
      const snap = makeSnapshot();
      const result = vfsTouch(snap, '/home/dojo/readme.txt');
      expect(result).toBe(snap);
    });

    it('returns error for existing directory', () => {
      const result = vfsTouch(makeSnapshot(), '/home/dojo');
      expect('root' in result).toBe(false);
      if ('root' in result) return;
      expect(result.type).toBe('is_a_directory');
    });
  });

  describe('vfsWriteFile', () => {
    it('overwrites existing file', () => {
      const result = vfsWriteFile(makeSnapshot(), '/home/dojo/readme.txt', 'new content', false);
      expect('root' in result).toBe(true);
      if (!('root' in result)) return;
      expect(vfsRead(result, '/home/dojo/readme.txt')).toBe('new content');
    });

    it('appends to existing file', () => {
      const result = vfsWriteFile(makeSnapshot(), '/home/dojo/readme.txt', 'appended', true);
      expect('root' in result).toBe(true);
      if (!('root' in result)) return;
      expect(vfsRead(result, '/home/dojo/readme.txt')).toBe('hello\nappended');
    });

    it('creates file if it does not exist', () => {
      const result = vfsWriteFile(makeSnapshot(), '/home/dojo/new.txt', 'created', false);
      expect('root' in result).toBe(true);
      if (!('root' in result)) return;
      expect(vfsRead(result, '/home/dojo/new.txt')).toBe('created');
    });

    it('enforces maxFileBytes budget', () => {
      const snapshot: VfsSnapshot = {
        ...makeSnapshot(),
        budgets: { maxNodes: 200, maxDepth: 10, maxFileBytes: 5 },
      };
      const result = vfsWriteFile(snapshot, '/home/dojo/readme.txt', 'way too long content', false);
      expect('root' in result).toBe(false);
      if ('root' in result) return;
      expect(result.type).toBe('budget_exceeded');
      expect(result.budget).toBe('max_file_bytes');
    });
  });

  describe('vfsRemoveFile', () => {
    it('removes an existing file', () => {
      const result = vfsRemoveFile(makeSnapshot(), '/home/dojo/readme.txt');
      expect('root' in result).toBe(true);
      if (!('root' in result)) return;
      expect(vfsResolve(result, '/home/dojo/readme.txt')).toBeNull();
    });

    it('returns error for missing path', () => {
      const result = vfsRemoveFile(makeSnapshot(), '/home/dojo/ghost.txt');
      expect('root' in result).toBe(false);
      if ('root' in result) return;
      expect(result.type).toBe('path_not_found');
    });

    it('returns error for directory', () => {
      const result = vfsRemoveFile(makeSnapshot(), '/home/dojo');
      expect('root' in result).toBe(false);
      if ('root' in result) return;
      expect(result.type).toBe('is_a_directory');
    });
  });
});
