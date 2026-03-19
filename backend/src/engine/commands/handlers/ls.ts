import { CommandExecution } from '../../engine.types';
import { CommandHandler } from '../command-handler.types';
import { getEffectiveMetadata, vfsList, vfsResolve } from '../../vfs/vfs.service';

export const lsHandler: CommandHandler = (args, vfs, cwd): CommandExecution => {
  const showHidden = args.includes('-a');
  const longFormat = args.includes('-l');
  const pathArgs = args.filter((a) => !a.startsWith('-'));
  const targetPath = pathArgs[0] ?? cwd;
  const targetNode = vfsResolve(vfs, targetPath);

  if (!targetNode) {
    return {
      stdout: '',
      stderr: `ls: cannot access '${targetPath}': No such file or directory: ${targetPath}`,
      exitCode: 1,
      vfsAfter: vfs,
      cwdAfter: cwd,
      effects: [],
      error: {
        type: 'path_not_found',
        message: `No such file or directory: ${targetPath}`,
        path: targetPath,
      },
    };
  }

  const entries =
    targetNode.type === 'dir'
      ? (() => {
          const result = vfsList(vfs, targetPath);
          if ('type' in result) {
            return result;
          }

          return result
            .filter((node) => showHidden || !node.name.startsWith('.'))
            .sort((left, right) => left.name.localeCompare(right.name));
        })()
      : [targetNode];

  if ('type' in entries) {
    return {
      stdout: '',
      stderr: `ls: cannot access '${targetPath}': ${entries.message}`,
      exitCode: 1,
      vfsAfter: vfs,
      cwdAfter: cwd,
      effects: [],
      error: entries,
    };
  }

  const rendered = entries.map((node) => {
    if (!longFormat) {
      return node.type === 'dir' ? `${node.name}/` : node.name;
    }

    const metadata = getEffectiveMetadata(node);
    const size = node.type === 'file' ? node.content.length : node.children.length;
    const kind = node.type === 'dir' ? 'd' : '-';
    return `${kind}${modeToSymbolic(metadata.mode)} 1 ${metadata.owner} ${metadata.group} ${size} ${node.name}`;
  });

  return {
    stdout: rendered.length > 0 ? rendered.join('\n') + '\n' : '',
    stderr: '',
    exitCode: 0,
    vfsAfter: vfs,
    cwdAfter: cwd,
    effects: [],
  };
};

function modeToSymbolic(mode: string): string {
  return mode
    .split('')
    .map((digit) => {
      const value = Number(digit);
      return `${value & 4 ? 'r' : '-'}${value & 2 ? 'w' : '-'}${value & 1 ? 'x' : '-'}`;
    })
    .join('');
}
