import { CommandHandler } from './command-handler.types';
import { pwdHandler } from './handlers/pwd';
import { lsHandler } from './handlers/ls';
import { cdHandler } from './handlers/cd';
import { catHandler } from './handlers/cat';
import { echoHandler } from './handlers/echo';
import { mkdirHandler } from './handlers/mkdir';
import { touchHandler } from './handlers/touch';
import { rmHandler } from './handlers/rm';
import { helpHandler } from './handlers/help';
import { CommandExecution, EngineError } from '../engine.types';
import { HandlerConstraints } from './command-handler.types';
import { VfsSnapshot } from '../engine.types';

const REGISTRY = new Map<string, CommandHandler>([
  ['pwd', pwdHandler],
  ['ls', lsHandler],
  ['cd', cdHandler],
  ['cat', catHandler],
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
