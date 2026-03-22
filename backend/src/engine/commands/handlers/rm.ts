import { CommandExecution } from '../../engine.types';
import { CommandHandler } from '../command-handler.types';
import { vfsRemoveFile } from '../../vfs/vfs.service';

export const rmHandler: CommandHandler = (args, vfs, cwd): CommandExecution => {
  const flags = args.filter((a) => a.startsWith('-'));
  const paths = args.filter((a) => !a.startsWith('-'));

  // Recursive flag is not supported for MVP
  if (flags.some((f) => f.includes('r') || f.includes('R'))) {
    return {
      stdout: '',
      stderr: 'rm: recursive removal is not supported in this environment',
      exitCode: 1,
      vfsAfter: vfs,
      cwdAfter: cwd,
      effects: [],
      error: {
        type: 'operation_not_allowed',
        message: 'recursive removal not supported',
        reason: 'MVP constraint',
      },
    };
  }

  if (paths.length === 0) {
    return {
      stdout: '',
      stderr: 'rm: missing operand',
      exitCode: 1,
      vfsAfter: vfs,
      cwdAfter: cwd,
      effects: [],
      error: { type: 'invalid_arguments', message: 'missing operand', commandName: 'rm' },
    };
  }

  let currentVfs = vfs;
  const removed: string[] = [];

  for (const filePath of paths) {
    const result = vfsRemoveFile(currentVfs, filePath);

    if ('type' in result) {
      return {
        stdout: '',
        stderr: `rm: cannot remove '${filePath}': ${result.message}`,
        exitCode: 1,
        vfsAfter: vfs,
        cwdAfter: cwd,
        effects: [],
        error: result,
      };
    }

    removed.push(filePath);
    currentVfs = result;
  }

  return {
    stdout: '',
    stderr: '',
    exitCode: 0,
    vfsAfter: currentVfs,
    cwdAfter: cwd,
    effects: removed.map((p) => ({ type: 'node_removed' as const, path: p })),
  };
};
