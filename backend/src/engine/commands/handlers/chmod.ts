import { CommandExecution, InvalidArgumentsError } from '../../engine.types';
import { CommandHandler } from '../command-handler.types';
import { vfsChmod } from '../../vfs/vfs.service';
import { resolvePath } from '../../resolver/path-resolver';

export const chmodHandler: CommandHandler = (args, vfs, cwd): CommandExecution => {
  const [mode, ...pathTokens] = args;

  if (!mode || pathTokens.length === 0) {
    const error: InvalidArgumentsError = {
      type: 'invalid_arguments',
      message: 'chmod: missing operand',
      commandName: 'chmod',
    };
    return {
      stdout: '',
      stderr: error.message,
      exitCode: 1,
      vfsAfter: vfs,
      cwdAfter: cwd,
      effects: [],
      error,
    };
  }

  const targetPath = resolvePath(cwd, pathTokens[0]);
  const result = vfsChmod(vfs, targetPath, mode);

  if ('type' in result) {
    return {
      stdout: '',
      stderr: `chmod: ${result.message}`,
      exitCode: 1,
      vfsAfter: vfs,
      cwdAfter: cwd,
      effects: [],
      error: result,
    };
  }

  return {
    stdout: '',
    stderr: '',
    exitCode: 0,
    vfsAfter: result,
    cwdAfter: cwd,
    effects: [],
  };
};
