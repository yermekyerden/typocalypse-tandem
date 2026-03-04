export type OutputErrorKind =
  | 'not-found'
  | 'not-a-directory'
  | 'not-a-file'
  | 'already-exists'
  | 'permission-denied'
  | 'invalid-path';

export type FsError = {
  kind: OutputErrorKind;
  message: string;
};

export type FileNode = {
  type: 'file';
  name: string;
  content: string;
  permissions?: string; // e.g. rwxr-xr-x
  hidden?: boolean;
};

export type DirectoryNode = {
  type: 'dir';
  name: string;
  children: Record<string, FileNode | DirectoryNode>;
  permissions?: string;
  hidden?: boolean;
};

export type VirtualFileSystem = DirectoryNode;

export type PathResolution =
  | { ok: true; node: FileNode | DirectoryNode; parent: DirectoryNode | null; path: string }
  | { ok: false; error: FsError };

export const DEFAULT_CWD = '/home/student';

function deepClone<T>(value: T): T {
  return structuredClone ? structuredClone(value) : JSON.parse(JSON.stringify(value));
}

function splitPath(path: string): string[] {
  return path.split('/').filter(Boolean);
}

function resolvePath(
  fs: VirtualFileSystem,
  cwd: string,
  rawPath: string,
): PathResolution {
  const base = cwd.endsWith('/') ? cwd.slice(0, -1) : cwd;
  const absolute = rawPath.startsWith('/') ? rawPath : `${base}/${rawPath}`;
  const parts = splitPath(absolute);

  let current: DirectoryNode | FileNode = fs;
  let parent: DirectoryNode | null = null;

  for (const part of parts) {
    if (part === '.') continue;
    if (part === '..') {
      if (!parent) {
        return { ok: false, error: { kind: 'invalid-path', message: 'Cannot go above root' } };
      }
      const parentPath = splitPath(parent.name).length
        ? parent.name
        : '/';
      return resolvePath(fs, parentPath, parts.slice(parts.indexOf(part) + 1).join('/'));
    }

    if (current.type !== 'dir') {
      return { ok: false, error: { kind: 'not-a-directory', message: `${part}: Not a directory` } };
    }

    const next: FileNode | DirectoryNode | undefined = current.children[part];
    if (!next) {
      return { ok: false, error: { kind: 'not-found', message: `${part}: No such file or directory` } };
    }
    parent = current;
    current = next;
  }

  return { ok: true, node: current, parent, path: absolute || '/' };
}

export function listDirectory(
  fs: VirtualFileSystem,
  cwd: string,
  path: string,
  includeHidden = false,
): { ok: true; entries: string[] } | { ok: false; error: FsError } {
  const resolved = resolvePath(fs, cwd, path || '.');
  if (!resolved.ok) return resolved;
  if (resolved.node.type !== 'dir') {
    return { ok: false, error: { kind: 'not-a-directory', message: 'Not a directory' } };
  }

  const entries = Object.values(resolved.node.children)
    .filter((node) => includeHidden || !node.hidden)
    .map((node) => node.name)
    .sort((a, b) => a.localeCompare(b));

  return { ok: true, entries };
}

export function readFile(
  fs: VirtualFileSystem,
  cwd: string,
  path: string,
): { ok: true; content: string } | { ok: false; error: FsError } {
  const resolved = resolvePath(fs, cwd, path);
  if (!resolved.ok) return resolved;
  if (resolved.node.type !== 'file') {
    return { ok: false, error: { kind: 'not-a-file', message: 'Is a directory' } };
  }
  return { ok: true, content: resolved.node.content };
}

export function changeDirectory(
  fs: VirtualFileSystem,
  cwd: string,
  path: string,
): { ok: true; cwd: string } | { ok: false; error: FsError } {
  const resolved = resolvePath(fs, cwd, path || '.');
  if (!resolved.ok) return resolved;
  if (resolved.node.type !== 'dir') {
    return { ok: false, error: { kind: 'not-a-directory', message: 'Not a directory' } };
  }
  return { ok: true, cwd: resolved.path || '/' };
}

export function makeDirectory(
  fs: VirtualFileSystem,
  cwd: string,
  path: string,
): { ok: true; fs: VirtualFileSystem } | { ok: false; error: FsError } {
  const segments = splitPath(path);
  if (segments.length === 0) {
    return { ok: false, error: { kind: 'invalid-path', message: 'Invalid path' } };
  }

  const targetName = segments.pop()!;
  const parentPath = segments.join('/') || '.';
  const resolvedParent = resolvePath(fs, cwd, parentPath);
  if (!resolvedParent.ok) return resolvedParent;
  if (resolvedParent.node.type !== 'dir') {
    return { ok: false, error: { kind: 'not-a-directory', message: 'Not a directory' } };
  }
  if (resolvedParent.node.children[targetName]) {
    return { ok: false, error: { kind: 'already-exists', message: 'File exists' } };
  }

  const clone = deepClone(fs);
  const targetParent = resolvePath(clone, cwd, parentPath);
  if (!targetParent.ok) return targetParent;
  if (targetParent.node.type !== 'dir') {
    return { ok: false, error: { kind: 'not-a-directory', message: 'Not a directory' } };
  }

  targetParent.node.children[targetName] = {
    type: 'dir',
    name: targetName,
    children: {},
  };

  return { ok: true, fs: clone };
}

export function touchFile(
  fs: VirtualFileSystem,
  cwd: string,
  path: string,
  content = '',
): { ok: true; fs: VirtualFileSystem } | { ok: false; error: FsError } {
  const segments = splitPath(path);
  if (segments.length === 0) {
    return { ok: false, error: { kind: 'invalid-path', message: 'Invalid path' } };
  }

  const fileName = segments.pop()!;
  const parentPath = segments.join('/') || '.';
  const resolvedParent = resolvePath(fs, cwd, parentPath);
  if (!resolvedParent.ok) return resolvedParent;
  if (resolvedParent.node.type !== 'dir') {
    return { ok: false, error: { kind: 'not-a-directory', message: 'Not a directory' } };
  }

  const clone = deepClone(fs);
  const targetParent = resolvePath(clone, cwd, parentPath);
  if (!targetParent.ok) return targetParent;
  if (targetParent.node.type !== 'dir') {
    return { ok: false, error: { kind: 'not-a-directory', message: 'Not a directory' } };
  }

  const existing = targetParent.node.children[fileName];
  if (existing && existing.type === 'dir') {
    return { ok: false, error: { kind: 'not-a-file', message: 'Is a directory' } };
  }

  targetParent.node.children[fileName] = existing
    ? { ...existing, type: 'file', name: fileName, content: existing.content }
    : { type: 'file', name: fileName, content };

  return { ok: true, fs: clone };
}

function file(name: string, content: string, opts: Partial<FileNode> = {}): FileNode {
  return { type: 'file', name, content, ...opts };
}

function dir(
  name: string,
  children: Array<FileNode | DirectoryNode>,
  opts: Partial<DirectoryNode> = {},
): DirectoryNode {
  const map: Record<string, FileNode | DirectoryNode> = {};
  children.forEach((child) => {
    map[child.name] = child;
  });
  return { type: 'dir', name, children: map, ...opts };
}

export function createInitialFs(): VirtualFileSystem {
  const home = dir('home', [
    dir(
      'student',
      [
        file(
          'mission.txt',
          `Welcome to Terminal Dojo.
Your mission begins here.

In this training environment you will learn how to:
- navigate through directories
- inspect files
- create and manage folders
- understand how the filesystem works

The terminal is your primary tool.
Precision and attention to detail matter.

Complete each task step by step.
Observe the output carefully.
Think before typing.

Good luck, trainee.`,
        ),
        file('notes.md', '# Notes\n- draft\n'),
        file('.secret_note', 'The real skill is paying attention.', { hidden: true }),
        file('.bashrc', '# bash config', { hidden: true }),
        file('.profile', '# profile config', { hidden: true }),
        dir('.config', [], { hidden: true }),
        dir('.cache', [], { hidden: true }),
        dir('Documents', []),
        dir('Downloads', []),
        dir('Projects', []),
        dir('scripts', []),
        dir(
          'training_zone',
          [
            file(
              'history.txt',
              `Terminal History Log

Did you know?

The Unix operating system was created in 1969 at Bell Labs.
Many modern systems, including Linux and macOS, are built on Unix principles.

The philosophy was simple:
- Build small tools
- Make them do one thing well
- Combine them together

Every command you type in this training
is part of a tradition that started over 50 years ago.

You are not just learning commands.
You are learning how systems think.`,
            ),
          ],
        ),
      ],
    ),
  ]);

  const varTmp = dir('var', [
    dir('tmp', [
      dir('rsschool', [
        dir('stage1', [
          file(
            'intro.txt',
            `RS School Stage 1
Every developer starts somewhere.
In this stage you learned:

- Git basics
- HTML & CSS
- JavaScript fundamentals

Strong foundations define strong engineers.`,
          ),
        ]),
        dir('stage2', [
          file('algorithms.txt', 'Sorting, searching, complexity basics.'),
        ]),
        dir('archive', [
          file(
            'history.txt',
            `RS School Archive Log

The Rolling Scopes School community
has helped thousands of developers
enter the IT industry.

Learning never stops.
Paths matter.
Understanding structure matters even more.`,
          ),
        ]),
      ]),
    ]),
  ]);

  const permissionsLab = dir('permissions_lab', [
    file(
      'rsstage1.txt',
      `RS School Stage 1 Log

Access to knowledge is controlled.
Understanding permissions means
understanding system security.

Every secure system starts
with correct access control.`,
      { permissions: '----------' },
    ),
    file('HELP', 'Run chmod to adjust permissions.'),
    file('deploy.sh', '#!/bin/bash\necho "deploy"\n', { permissions: '-rwxr-xr-x' }),
    file('notes.txt', 'Permissions practice notes.'),
    dir('reports', []),
  ]);

  return dir('/', [home, varTmp, permissionsLab]);
}
