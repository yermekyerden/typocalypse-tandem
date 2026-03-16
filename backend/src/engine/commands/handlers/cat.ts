import { CommandExecution } from '../../engine.types';
import { CommandHandler } from '../command-handler.types';
import { vfsRead } from '../../vfs/vfs.service';

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
    const result = vfsRead(vfs, filePath);

    if (typeof result !== 'string') {
      return {
        stdout: '',
        stderr: `cat: ${filePath}: ${result.message}`,
        exitCode: 1,
        vfsAfter: vfs,
        cwdAfter: cwd,
        effects: [],
        error: result,
      };
    }

    outputs.push(result);
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
