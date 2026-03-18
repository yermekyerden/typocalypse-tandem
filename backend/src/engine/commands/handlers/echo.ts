import { CommandExecution } from '../../engine.types';
import { CommandHandler } from '../command-handler.types';

/**
 * Produces text to stdout. Redirect (> / >>) is handled by EngineService
 * after this handler returns, so this function never writes to the VFS.
 */
export const echoHandler: CommandHandler = (args, vfs, cwd): CommandExecution => {
  const noNewline = args[0] === '-n';
  const textArgs = noNewline ? args.slice(1) : args;
  const text = textArgs.join(' ');
  const output = noNewline ? text : text + '\n';

  return {
    stdout: output,
    stderr: '',
    exitCode: 0,
    vfsAfter: vfs,
    cwdAfter: cwd,
    effects: [],
  };
};
