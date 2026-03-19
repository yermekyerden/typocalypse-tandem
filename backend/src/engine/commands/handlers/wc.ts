import { CommandExecution } from '../../engine.types';
import { basename } from '../../resolver/path-resolver';
import { vfsRead } from '../../vfs/vfs.service';
import { CommandHandler } from '../command-handler.types';

export const wcHandler: CommandHandler = (args, vfs, cwd): CommandExecution => {
  const lineCountOnly = args[0] === '-l';
  const fileArgs = lineCountOnly ? args.slice(1) : args;

  if (!lineCountOnly || fileArgs.length === 0) {
    return {
      stdout: '',
      stderr: 'wc: only "wc -l <file>" is supported',
      exitCode: 1,
      vfsAfter: vfs,
      cwdAfter: cwd,
      effects: [],
      error: {
        type: 'invalid_arguments',
        message: 'only "wc -l <file>" is supported',
        commandName: 'wc',
      },
    };
  }

  const filePath = fileArgs[0];
  const result = vfsRead(vfs, filePath);

  if (typeof result !== 'string') {
    return {
      stdout: '',
      stderr: `wc: ${filePath}: ${result.message}`,
      exitCode: 1,
      vfsAfter: vfs,
      cwdAfter: cwd,
      effects: [],
      error: result,
    };
  }

  const lineCount = result.length === 0 ? 0 : result.split('\n').filter((_, index, arr) => index < arr.length - 1 || arr[index] !== '').length;

  return {
    stdout: `${lineCount} ${basename(filePath)}\n`,
    stderr: '',
    exitCode: 0,
    vfsAfter: vfs,
    cwdAfter: cwd,
    effects: [],
  };
};
