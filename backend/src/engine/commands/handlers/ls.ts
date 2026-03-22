import { CommandExecution } from '../../engine.types';
import { CommandHandler } from '../command-handler.types';
import { vfsList } from '../../vfs/vfs.service';

export const lsHandler: CommandHandler = (args, vfs, cwd): CommandExecution => {
  const showHidden = args.includes('-a');
  const pathArgs = args.filter((a) => !a.startsWith('-'));
  const targetPath = pathArgs[0] ?? cwd;

  const result = vfsList(vfs, targetPath);

  if ('type' in result) {
    return {
      stdout: '',
      stderr: `ls: cannot access '${targetPath}': ${result.message}`,
      exitCode: 1,
      vfsAfter: vfs,
      cwdAfter: cwd,
      effects: [],
      error: result,
    };
  }

  const entries = result
    .filter((node) => showHidden || !node.name.startsWith('.'))
    .map((node) => (node.type === 'dir' ? node.name + '/' : node.name))
    .sort();

  return {
    stdout: entries.length > 0 ? entries.join('\n') + '\n' : '',
    stderr: '',
    exitCode: 0,
    vfsAfter: vfs,
    cwdAfter: cwd,
    effects: [],
  };
};
