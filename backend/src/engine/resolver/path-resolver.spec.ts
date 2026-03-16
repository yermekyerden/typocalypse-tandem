import { resolvePath, resolveArgs, parentPath, basename } from './path-resolver';

describe('PathResolver', () => {
  describe('resolvePath', () => {
    it('absolute path ignores cwd', () => {
      expect(resolvePath('/home/dojo', '/tmp')).toBe('/tmp');
    });

    it('relative path resolved against cwd', () => {
      expect(resolvePath('/home/dojo', 'projects')).toBe('/home/dojo/projects');
    });

    it('. stays at same level', () => {
      expect(resolvePath('/home/dojo', '.')).toBe('/home/dojo');
    });

    it('.. goes to parent', () => {
      expect(resolvePath('/home/dojo', '..')).toBe('/home');
    });

    it('.. at root stays at root', () => {
      expect(resolvePath('/', '..')).toBe('/');
    });

    it('normalizes multiple slashes', () => {
      expect(resolvePath('/home/dojo', '../dojo/../dojo')).toBe('/home/dojo');
    });
  });

  describe('resolveArgs', () => {
    it('resolves path args and keeps flags unchanged', () => {
      const result = resolveArgs(['-a', 'projects'], '/home/dojo');
      expect(result).toEqual([
        { raw: '-a', resolved: '-a' },
        { raw: 'projects', resolved: '/home/dojo/projects' },
      ]);
    });
  });

  describe('parentPath', () => {
    it('returns parent of nested path', () => {
      expect(parentPath('/home/dojo/file.txt')).toBe('/home/dojo');
    });

    it('returns root for top-level path', () => {
      expect(parentPath('/home')).toBe('/');
    });

    it('returns root for root', () => {
      expect(parentPath('/')).toBe('/');
    });
  });

  describe('basename', () => {
    it('returns last segment', () => {
      expect(basename('/home/dojo/file.txt')).toBe('file.txt');
    });

    it('returns empty string for root', () => {
      expect(basename('/')).toBe('');
    });
  });
});
