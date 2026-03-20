import { CommandExecution } from '../../engine.types';
import { CommandHandler } from '../command-handler.types';
import { vfsResolve } from '../../vfs/vfs.service';

export const cdHandler: CommandHandler = (args, vfs, cwd): CommandExecution => {
  if (args.length === 0) {
    // cd with no args → go to root (simulated home)
    return { stdout: '', stderr: '', exitCode: 0, vfsAfter: vfs, cwdAfter: '/', effects: [] };
  }

  const targetPath = args[0];
  const node = vfsResolve(vfs, targetPath);

  if (!node) {
    return {
      stdout: '',
      stderr: `cd: ${targetPath}: No such file or directory`,
      exitCode: 1,
      vfsAfter: vfs,
      cwdAfter: cwd,
      effects: [],
      error: {
        type: 'path_not_found',
        message: `No such file or directory: ${targetPath}`,
        path: targetPath,
      },
    };
  }

  if (node.type !== 'dir') {
    return {
      stdout: '',
      stderr: `cd: ${targetPath}: Not a directory`,
      exitCode: 1,
      vfsAfter: vfs,
      cwdAfter: cwd,
      effects: [],
      error: {
        type: 'not_a_directory',
        message: `Not a directory: ${targetPath}`,
        path: targetPath,
      },
    };
  }

  return {
    stdout: '',
    stderr: '',
    exitCode: 0,
    vfsAfter: vfs,
    cwdAfter: targetPath,
    effects: [{ type: 'cwd_changed', from: cwd, to: targetPath }],
  };
};
