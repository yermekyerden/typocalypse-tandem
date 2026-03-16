import { CommandExecution } from '../../engine.types';
import { CommandHandler } from '../command-handler.types';
import { vfsTouch } from '../../vfs/vfs.service';

export const touchHandler: CommandHandler = (args, vfs, cwd): CommandExecution => {
  if (args.length === 0) {
    return {
      stdout: '',
      stderr: 'touch: missing file operand',
      exitCode: 1,
      vfsAfter: vfs,
      cwdAfter: cwd,
      effects: [],
      error: { type: 'invalid_arguments', message: 'missing file operand', commandName: 'touch' },
    };
  }

  let currentVfs = vfs;
  const created: string[] = [];

  for (const filePath of args) {
    const nodeExisted = !!currentVfs.root;
    const result = vfsTouch(currentVfs, filePath);

    if ('type' in result) {
      return {
        stdout: '',
        stderr: `touch: cannot touch '${filePath}': ${result.message}`,
        exitCode: 1,
        vfsAfter: vfs,
        cwdAfter: cwd,
        effects: [],
        error: result,
      };
    }

    // Only count as created if the snapshot actually changed
    if (result !== currentVfs || !nodeExisted) {
      created.push(filePath);
    }

    currentVfs = result;
  }

  return {
    stdout: '',
    stderr: '',
    exitCode: 0,
    vfsAfter: currentVfs,
    cwdAfter: cwd,
    effects: created.map((p) => ({
      type: 'node_created' as const,
      path: p,
      kind: 'file' as const,
    })),
  };
};
