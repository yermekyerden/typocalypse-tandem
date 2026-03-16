import { CommandExecution } from '../../engine.types';
import { CommandHandler } from '../command-handler.types';
import { vfsMkdir } from '../../vfs/vfs.service';

export const mkdirHandler: CommandHandler = (args, vfs, cwd): CommandExecution => {
  if (args.length === 0) {
    return {
      stdout: '',
      stderr: 'mkdir: missing operand',
      exitCode: 1,
      vfsAfter: vfs,
      cwdAfter: cwd,
      effects: [],
      error: { type: 'invalid_arguments', message: 'missing operand', commandName: 'mkdir' },
    };
  }

  let currentVfs = vfs;

  for (const dirPath of args) {
    const result = vfsMkdir(currentVfs, dirPath);

    if ('type' in result) {
      return {
        stdout: '',
        stderr: `mkdir: cannot create directory '${dirPath}': ${result.message}`,
        exitCode: 1,
        vfsAfter: vfs,
        cwdAfter: cwd,
        effects: [],
        error: result,
      };
    }

    currentVfs = result;
  }

  return {
    stdout: '',
    stderr: '',
    exitCode: 0,
    vfsAfter: currentVfs,
    cwdAfter: cwd,
    effects: args.map((p) => ({ type: 'node_created' as const, path: p, kind: 'dir' as const })),
  };
};
