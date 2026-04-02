import { CommandExecution, EngineError, VfsSnapshot } from '../engine.types';
import { CommandHandler, HandlerConstraints } from './command-handler.types';
import {
  catHandler,
  cdHandler,
  chmodHandler,
  echoHandler,
  helpHandler,
  lsHandler,
  mkdirHandler,
  pwdHandler,
  rmHandler,
  touchHandler,
} from './handlers';

const REGISTRY = new Map<string, CommandHandler>([
  ['pwd', pwdHandler],
  ['ls', lsHandler],
  ['cd', cdHandler],
  ['cat', catHandler],
  ['chmod', chmodHandler],
  ['echo', echoHandler],
  ['mkdir', mkdirHandler],
  ['touch', touchHandler],
  ['rm', rmHandler],
  ['help', helpHandler],
]);

export function dispatch(
  commandName: string,
  args: string[],
  vfs: VfsSnapshot,
  cwd: string,
  constraints: HandlerConstraints,
): CommandExecution {
  const handler = REGISTRY.get(commandName);

  if (!handler) {
    const error: EngineError = {
      type: 'unknown_command',
      message: `command not found: ${commandName}`,
      commandName,
    };
    return {
      stdout: '',
      stderr: `${commandName}: command not found`,
      exitCode: 127,
      vfsAfter: vfs,
      cwdAfter: cwd,
      effects: [],
      error,
    };
  }

  return handler(args, vfs, cwd, constraints);
}

export function getRegisteredCommands(): string[] {
  return [...REGISTRY.keys()];
}
