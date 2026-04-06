/**
 * Resolves POSIX paths (relative and absolute) against a cwd and VfsSnapshot.
 * Returns normalized absolute paths. Does not check whether the path exists in
 * the VFS — that is the responsibility of the command handler.
 */

import { splitPath } from '../vfs/vfs.service';

/**
 * Resolves `inputPath` relative to `cwd`.
 * - Absolute paths (`/...`) ignore `cwd`.
 * - `.` stays at current level.
 * - `..` goes to parent; stops at root.
 * - Trailing slashes are stripped; root is always `/`.
 */
export function resolvePath(cwd: string, inputPath: string): string {
  const base = inputPath.startsWith('/') ? '/' : cwd;
  const combined = base === '/' ? '/' + inputPath : base + '/' + inputPath;

  const segments = combined.split('/').filter((s) => s.length > 0);
  const resolved: string[] = [];

  for (const seg of segments) {
    if (seg === '.') continue;
    if (seg === '..') {
      resolved.pop();
    } else {
      resolved.push(seg);
    }
  }

  return '/' + resolved.join('/');
}

/**
 * Resolves each argument that looks like a path token.
 * Non-path args (flags starting with `-`) are returned unchanged.
 */
export function resolveArgs(args: string[], cwd: string): Array<{ raw: string; resolved: string }> {
  return args.map((arg) => ({
    raw: arg,
    resolved: arg.startsWith('-') ? arg : resolvePath(cwd, arg),
  }));
}

/**
 * Returns the parent path for an absolute path.
 * `/home/dojo/file` → `/home/dojo`
 * `/` → `/`
 */
export function parentPath(absolutePath: string): string {
  const segments = splitPath(absolutePath);
  if (segments.length <= 1) return '/';
  return '/' + segments.slice(0, -1).join('/');
}

/**
 * Returns the last segment of an absolute path (basename).
 * `/home/dojo/file.txt` → `file.txt`
 * `/` → ``
 */
export function basename(absolutePath: string): string {
  const segments = splitPath(absolutePath);
  return segments[segments.length - 1] ?? '';
}
