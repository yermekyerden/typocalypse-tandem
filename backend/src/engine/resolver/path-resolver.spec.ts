import { resolvePath, resolveArgs, parentPath, basename } from './path-resolver';

describe('PathResolver', () => {
  describe('resolvePath', () => {
    test.each([
      ['/home/dojo', '/tmp', '/tmp'],
      ['/home/dojo', 'projects', '/home/dojo/projects'],
      ['/home/dojo', '.', '/home/dojo'],
      ['/home/dojo', '..', '/home'],
      ['/', '..', '/'],
      ['/home/dojo', '../dojo/../dojo', '/home/dojo'],
    ])('resolvePath(%s, %s) -> %s', (cwd, input, expected) => {
      expect(resolvePath(cwd, input)).toBe(expected);
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
