import { CommandExecution, VfsDirNode, VfsFileNode, VfsNode } from '../../engine.types';
import { CommandHandler } from '../command-handler.types';
import { vfsList, vfsResolve } from '../../vfs/vfs.service';

/** Converts a 3-digit octal permission string to rwx notation (9 chars). */
function octalToRwx(octal: string): string {
  const digits = octal.slice(-3).padStart(3, '0');
  return digits
    .split('')
    .map((d) => {
      const n = parseInt(d, 10);
      return (n & 4 ? 'r' : '-') + (n & 2 ? 'w' : '-') + (n & 1 ? 'x' : '-');
    })
    .join('');
}

function formatLongEntry(node: VfsNode): string {
  const isDir = node.type === 'dir';
  const perms = (node as VfsDirNode | VfsFileNode).permissions ?? (isDir ? '755' : '644');
  const rwx = octalToRwx(perms);
  const modePrefix = isDir ? 'd' : '-';
  const name = isDir ? node.name + '/' : node.name;
  const size = isDir ? 0 : node.content.length;
  return `${modePrefix}${rwx} dojo ${size} ${name}`;
}

export const lsHandler: CommandHandler = (args, vfs, cwd): CommandExecution => {
  const flags = args.filter((a) => a.startsWith('-')).join('');
  const showHidden = flags.includes('a');
  const longFormat = flags.includes('l');
  const pathArgs = args.filter((a) => !a.startsWith('-'));
  const targetPath = pathArgs[0] ?? cwd;

  const listResult = vfsList(vfs, targetPath);

  if (!Array.isArray(listResult)) {
    // vfsList returned an error — could be a file path; try single-file branch
    const node = vfsResolve(vfs, targetPath);

    if (!node || node.type !== 'file') {
      return {
        stdout: '',
        stderr: `ls: cannot access '${targetPath}': ${listResult.message}`,
        exitCode: 1,
        vfsAfter: vfs,
        cwdAfter: cwd,
        effects: [],
        error: listResult,
      };
    }

    // Hidden-file guard: single-file paths starting with '.' require -a
    const basename = targetPath.split('/').pop() ?? '';
    if (basename.startsWith('.') && !showHidden) {
      return {
        stdout: '',
        stderr: `ls: cannot access '${targetPath}': No such file or directory`,
        exitCode: 1,
        vfsAfter: vfs,
        cwdAfter: cwd,
        effects: [],
        error: { type: 'path_not_found', message: 'No such file or directory', path: targetPath },
      };
    }

    const line = longFormat ? formatLongEntry(node) : node.name;
    return {
      stdout: line + '\n',
      stderr: '',
      exitCode: 0,
      vfsAfter: vfs,
      cwdAfter: cwd,
      effects: [],
    };
  }

  const entries = listResult
    .filter((node) => showHidden || !node.name.startsWith('.'))
    .sort((a, b) => a.name.localeCompare(b.name));

  const lines = longFormat
    ? entries.map((node) => formatLongEntry(node))
    : entries.map((node) => (node.type === 'dir' ? node.name + '/' : node.name));

  return {
    stdout: lines.length > 0 ? lines.join('\n') + '\n' : '',
    stderr: '',
    exitCode: 0,
    vfsAfter: vfs,
    cwdAfter: cwd,
    effects: [],
  };
};
