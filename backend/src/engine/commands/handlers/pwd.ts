import { CommandExecution } from '../../engine.types';
import { CommandHandler } from '../command-handler.types';

export const pwdHandler: CommandHandler = (_args: string[], vfs, cwd): CommandExecution => ({
  stdout: cwd + '\n',
  stderr: '',
  exitCode: 0,
  vfsAfter: vfs,
  cwdAfter: cwd,
  effects: [],
});
