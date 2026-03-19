import { CommandExecution } from '../../engine.types';
import { vfsChmod } from '../../vfs/vfs.service';
import { CommandHandler } from '../command-handler.types';

export const chmodHandler: CommandHandler = (args, vfs, cwd): CommandExecution => {
  if (args.length < 2) {
    return {
      stdout: '',
      stderr: 'chmod: missing operand',
      exitCode: 1,
      vfsAfter: vfs,
      cwdAfter: cwd,
      effects: [],
      error: { type: 'invalid_arguments', message: 'missing operand', commandName: 'chmod' },
    };
  }

  const [rawMode, targetPath] = args;
  const mode = rawMode.includes('/') ? rawMode.slice(rawMode.lastIndexOf('/') + 1) : rawMode;

  if (!/^[0-7]{3}$/.test(mode)) {
    return {
      stdout: '',
      stderr: `chmod: invalid mode: '${mode}'`,
      exitCode: 1,
      vfsAfter: vfs,
      cwdAfter: cwd,
      effects: [],
      error: { type: 'invalid_arguments', message: `invalid mode: ${mode}`, commandName: 'chmod' },
    };
  }

  const result = vfsChmod(vfs, targetPath, mode);

  if ('type' in result) {
    return {
      stdout: '',
      stderr: `chmod: cannot access '${targetPath}': ${result.message}`,
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
