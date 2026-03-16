/**
 * Pure, immutable functions on VfsSnapshot.
 * Every mutating function returns a new snapshot; the original is untouched.
 * Budget violations return typed error objects — no exceptions.
 */

import {
  BudgetExceededError,
  IsADirectoryError,
  NotADirectoryError,
  PathNotFoundError,
  VfsBudgets,
  VfsDirNode,
  VfsFileNode,
  VfsNode,
  VfsSnapshot,
  DEFAULT_BUDGETS,
} from '../engine.types';

export type VfsError =
  | PathNotFoundError
  | NotADirectoryError
  | IsADirectoryError
  | BudgetExceededError;

// ── Read operations ────────────────────────────────────────────────────────

/** Returns the node at the absolute path, or null if it does not exist. */
export function vfsResolve(snapshot: VfsSnapshot, absolutePath: string): VfsNode | null {
  const segments = splitPath(absolutePath);
  let node: VfsNode = snapshot.root;

  for (const seg of segments) {
    if (node.type !== 'dir') return null;
    const child: VfsNode | undefined = node.children.find((c) => c.name === seg);
    if (!child) return null;
    node = child;
  }

  return node;
}

/** Lists children of a directory. Returns an error if path is missing or not a dir. */
export function vfsList(
  snapshot: VfsSnapshot,
  absolutePath: string,
): VfsNode[] | PathNotFoundError | NotADirectoryError {
  const node = vfsResolve(snapshot, absolutePath);

  if (!node) {
    return {
      type: 'path_not_found',
      message: `No such file or directory: ${absolutePath}`,
      path: absolutePath,
    };
  }

  if (node.type !== 'dir') {
    return {
      type: 'not_a_directory',
      message: `Not a directory: ${absolutePath}`,
      path: absolutePath,
    };
  }

  return node.children;
}

/** Reads content of a file. Returns an error if path is missing or is a dir. */
export function vfsRead(
  snapshot: VfsSnapshot,
  absolutePath: string,
): string | PathNotFoundError | IsADirectoryError {
  const node = vfsResolve(snapshot, absolutePath);

  if (!node) {
    return {
      type: 'path_not_found',
      message: `No such file or directory: ${absolutePath}`,
      path: absolutePath,
    };
  }

  if (node.type === 'dir') {
    return {
      type: 'is_a_directory',
      message: `Is a directory: ${absolutePath}`,
      path: absolutePath,
    };
  }

  return node.content;
}

// ── Write operations (return new VfsSnapshot) ──────────────────────────────

/** Creates a directory at absolutePath. Parent must exist and be a dir. */
export function vfsMkdir(snapshot: VfsSnapshot, absolutePath: string): VfsSnapshot | VfsError {
  const budgets = effectiveBudgets(snapshot);
  const segments = splitPath(absolutePath);

  if (segments.length === 0) {
    return {
      type: 'invalid_arguments',
      message: 'Cannot mkdir root.',
      commandName: 'mkdir',
    } as unknown as VfsError;
  }

  const parentSegments = segments.slice(0, -1);
  const newName = segments[segments.length - 1];

  const parentResult = resolveDir(snapshot.root, parentSegments, absolutePath);
  if (parentResult.type !== 'dir') return parentResult;

  const parentDir = parentResult;
  if (parentDir.children.some((c) => c.name === newName)) {
    return {
      type: 'path_not_found',
      message: `mkdir: cannot create directory '${absolutePath}': File exists`,
      path: absolutePath,
    };
  }

  const nodeCount = countNodes(snapshot.root);
  if (nodeCount + 1 > budgets.maxNodes) {
    return {
      type: 'budget_exceeded',
      message: 'VFS node budget exceeded.',
      budget: 'max_vfs_nodes',
    };
  }

  const depth = segments.length + 1; // +1 for root
  if (depth > budgets.maxDepth) {
    return {
      type: 'budget_exceeded',
      message: 'VFS depth budget exceeded.',
      budget: 'max_vfs_depth',
    };
  }

  const newDir: VfsDirNode = { type: 'dir', name: newName, children: [] };
  const newRoot = updateNode(snapshot.root, parentSegments, (node) => {
    const dir = node as VfsDirNode;
    return { ...dir, children: [...dir.children, newDir] };
  }) as VfsDirNode;

  return { ...snapshot, root: newRoot };
}

/** Creates an empty file at absolutePath. Parent must exist. No-op if file already exists. */
export function vfsTouch(snapshot: VfsSnapshot, absolutePath: string): VfsSnapshot | VfsError {
  const budgets = effectiveBudgets(snapshot);
  const segments = splitPath(absolutePath);

  if (segments.length === 0) {
    return {
      type: 'invalid_arguments',
      message: 'Cannot touch root.',
      commandName: 'touch',
    } as unknown as VfsError;
  }

  const parentSegments = segments.slice(0, -1);
  const newName = segments[segments.length - 1];

  const parentResult = resolveDir(snapshot.root, parentSegments, absolutePath);
  if (parentResult.type !== 'dir') return parentResult;

  const parentDir = parentResult;

  // If file already exists, no-op
  const existing = parentDir.children.find((c) => c.name === newName);
  if (existing) {
    if (existing.type === 'dir') {
      return {
        type: 'is_a_directory',
        message: `Is a directory: ${absolutePath}`,
        path: absolutePath,
      };
    }
    return snapshot; // no-op for existing files
  }

  const nodeCount = countNodes(snapshot.root);
  if (nodeCount + 1 > budgets.maxNodes) {
    return {
      type: 'budget_exceeded',
      message: 'VFS node budget exceeded.',
      budget: 'max_vfs_nodes',
    };
  }

  const depth = segments.length + 1;
  if (depth > budgets.maxDepth) {
    return {
      type: 'budget_exceeded',
      message: 'VFS depth budget exceeded.',
      budget: 'max_vfs_depth',
    };
  }

  const newFile: VfsFileNode = { type: 'file', name: newName, content: '' };
  const newRoot = updateNode(snapshot.root, parentSegments, (node) => {
    const dir = node as VfsDirNode;
    return { ...dir, children: [...dir.children, newFile] };
  }) as VfsDirNode;

  return { ...snapshot, root: newRoot };
}

/** Writes content to a file (overwrites or appends). Creates the file if it does not exist. */
export function vfsWriteFile(
  snapshot: VfsSnapshot,
  absolutePath: string,
  content: string,
  append: boolean,
): VfsSnapshot | VfsError {
  const budgets = effectiveBudgets(snapshot);
  const segments = splitPath(absolutePath);

  if (segments.length === 0) {
    return {
      type: 'is_a_directory',
      message: 'Cannot write to root directory.',
      path: absolutePath,
    };
  }

  const parentSegments = segments.slice(0, -1);
  const fileName = segments[segments.length - 1];

  const parentResult = resolveDir(snapshot.root, parentSegments, absolutePath);
  if (parentResult.type !== 'dir') return parentResult;

  const parentDir = parentResult;
  const existing = parentDir.children.find((c) => c.name === fileName);

  if (existing?.type === 'dir') {
    return {
      type: 'is_a_directory',
      message: `Is a directory: ${absolutePath}`,
      path: absolutePath,
    };
  }

  const existingContent = existing?.type === 'file' ? existing.content : '';
  const newContent = append ? existingContent + content : content;

  if (newContent.length > budgets.maxFileBytes) {
    return {
      type: 'budget_exceeded',
      message: 'File size budget exceeded.',
      budget: 'max_file_bytes',
    };
  }

  let newRoot: VfsDirNode;

  if (!existing) {
    const nodeCount = countNodes(snapshot.root);
    if (nodeCount + 1 > budgets.maxNodes) {
      return {
        type: 'budget_exceeded',
        message: 'VFS node budget exceeded.',
        budget: 'max_vfs_nodes',
      };
    }

    const depth = segments.length + 1;
    if (depth > budgets.maxDepth) {
      return {
        type: 'budget_exceeded',
        message: 'VFS depth budget exceeded.',
        budget: 'max_vfs_depth',
      };
    }

    const newFile: VfsFileNode = { type: 'file', name: fileName, content: newContent };
    newRoot = updateNode(snapshot.root, parentSegments, (node) => {
      const dir = node as VfsDirNode;
      return { ...dir, children: [...dir.children, newFile] };
    }) as VfsDirNode;
  } else {
    const updatedFile: VfsFileNode = { type: 'file', name: fileName, content: newContent };
    newRoot = updateNode(snapshot.root, segments, () => updatedFile) as VfsDirNode;
  }

  return { ...snapshot, root: newRoot };
}

/** Removes a file at absolutePath. Does NOT support directories. */
export function vfsRemoveFile(snapshot: VfsSnapshot, absolutePath: string): VfsSnapshot | VfsError {
  const segments = splitPath(absolutePath);

  if (segments.length === 0) {
    return { type: 'is_a_directory', message: 'Cannot remove root.', path: absolutePath };
  }

  const parentSegments = segments.slice(0, -1);
  const fileName = segments[segments.length - 1];

  const parentResult = resolveDir(snapshot.root, parentSegments, absolutePath);
  if (parentResult.type !== 'dir') return parentResult;

  const parentDir = parentResult;
  const existing = parentDir.children.find((c) => c.name === fileName);

  if (!existing) {
    return {
      type: 'path_not_found',
      message: `No such file or directory: ${absolutePath}`,
      path: absolutePath,
    };
  }

  if (existing.type === 'dir') {
    return {
      type: 'is_a_directory',
      message: `Is a directory: ${absolutePath}`,
      path: absolutePath,
    };
  }

  const newRoot = updateNode(snapshot.root, parentSegments, (node) => {
    const dir = node as VfsDirNode;
    return { ...dir, children: dir.children.filter((c) => c.name !== fileName) };
  }) as VfsDirNode;

  return { ...snapshot, root: newRoot };
}

// ── Helpers ────────────────────────────────────────────────────────────────

export function splitPath(absolutePath: string): string[] {
  return absolutePath.split('/').filter((s) => s.length > 0);
}

function effectiveBudgets(snapshot: VfsSnapshot): VfsBudgets {
  return {
    maxNodes: snapshot.budgets?.maxNodes ?? DEFAULT_BUDGETS.maxNodes,
    maxDepth: snapshot.budgets?.maxDepth ?? DEFAULT_BUDGETS.maxDepth,
    maxFileBytes: snapshot.budgets?.maxFileBytes ?? DEFAULT_BUDGETS.maxFileBytes,
  };
}

function countNodes(node: VfsNode): number {
  if (node.type === 'file') return 1;
  return 1 + node.children.reduce((sum, child) => sum + countNodes(child), 0);
}

/** Finds a dir node by following path segments from the given root. */
function resolveDir(
  root: VfsDirNode,
  segments: string[],
  contextPath: string,
): VfsDirNode | PathNotFoundError | NotADirectoryError {
  let current: VfsNode = root;

  for (const seg of segments) {
    if (current.type !== 'dir') {
      return {
        type: 'not_a_directory',
        message: `Not a directory: ${contextPath}`,
        path: contextPath,
      };
    }
    const child: VfsNode | undefined = current.children.find((c) => c.name === seg);
    if (!child) {
      return {
        type: 'path_not_found',
        message: `No such file or directory: ${contextPath}`,
        path: contextPath,
      };
    }
    current = child;
  }

  if (current.type !== 'dir') {
    return {
      type: 'not_a_directory',
      message: `Not a directory: ${contextPath}`,
      path: contextPath,
    };
  }

  return current;
}

/**
 * Returns a new tree where the node at `segments` (from root) is replaced by
 * the result of calling `transform` on it. Creates new node objects on the
 * path (structural sharing for unchanged branches).
 */
function updateNode(
  root: VfsDirNode,
  segments: string[],
  transform: (node: VfsNode) => VfsNode,
): VfsNode {
  if (segments.length === 0) {
    return transform(root);
  }

  const [head, ...rest] = segments;
  const updatedChildren: VfsNode[] = root.children.map((child: VfsNode) => {
    if (child.name !== head) return child;
    return rest.length === 0 ? transform(child) : updateNode(child as VfsDirNode, rest, transform);
  });

  return { ...root, children: updatedChildren };
}
