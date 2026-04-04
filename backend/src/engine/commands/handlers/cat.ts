import { CommandExecution, OperationNotAllowedError, VfsFileNode } from '../../engine.types';
import { CommandHandler } from '../command-handler.types';
import { vfsRead, vfsResolve } from '../../vfs/vfs.service';

/** Returns true if the node's owner read bit is set (or no permissions set — default readable). */
function isReadable(node: VfsFileNode): boolean {
  const perms = node.permissions ?? '644';
  const ownerDigit = parseInt(perms[0] ?? '6', 10);
  return (ownerDigit & 4) !== 0;
}

export const catHandler: CommandHandler = (args, vfs, cwd): CommandExecution => {
  if (args.length === 0) {
    return {
      stdout: '',
      stderr: 'cat: missing operand',
      exitCode: 1,
      vfsAfter: vfs,
      cwdAfter: cwd,
      effects: [],
      error: { type: 'invalid_arguments', message: 'missing operand', commandName: 'cat' },
    };
  }

  const outputs: string[] = [];

  for (const filePath of args) {
    // Check existence first — path_not_found must not be confused with operation_not_allowed
    const node = vfsResolve(vfs, filePath);

    if (!node) {
      return {
        stdout: '',
        stderr: `cat: ${filePath}: No such file or directory`,
        exitCode: 1,
        vfsAfter: vfs,
        cwdAfter: cwd,
        effects: [],
        error: { type: 'path_not_found', message: 'No such file or directory', path: filePath },
      };
    }

    const readResult = vfsRead(vfs, filePath);

    if (typeof readResult !== 'string') {
      // is_a_directory — node exists but is not a file
      return {
        stdout: '',
        stderr: `cat: ${filePath}: ${readResult.message}`,
        exitCode: 1,
        vfsAfter: vfs,
        cwdAfter: cwd,
        effects: [],
        error: readResult,
      };
    }

    // File exists and is readable — check permissions
    const fileNode = node as VfsFileNode;
    if (!isReadable(fileNode)) {
      const error: OperationNotAllowedError = {
        type: 'operation_not_allowed',
        message: `${filePath}: Permission denied`,
        reason: `file permissions: ${fileNode.permissions ?? '644'}`,
      };
      return {
        stdout: '',
        stderr: `cat: ${error.message}`,
        exitCode: 1,
        vfsAfter: vfs,
        cwdAfter: cwd,
        effects: [],
        error,
      };
    }

    outputs.push(readResult);
  }

  return {
    stdout: outputs.join(''),
    stderr: '',
    exitCode: 0,
    vfsAfter: vfs,
    cwdAfter: cwd,
    effects: [],
  };
};
