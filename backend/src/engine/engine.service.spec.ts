import { Test } from '@nestjs/testing';
import { EngineService } from './engine.service';
import { VfsSnapshot, MissionCheck } from './engine.types';
import { vfsResolve } from './vfs/vfs.service';

function makeVfs(): VfsSnapshot {
  return {
    root: {
      type: 'dir',
      name: '',
      children: [
        {
          type: 'dir',
          name: 'home',
          children: [
            {
              type: 'dir',
              name: 'dojo',
              children: [],
            },
          ],
        },
      ],
    },
  };
}

const NO_CHECKS: MissionCheck[] = [];

describe('EngineService', () => {
  let engine: EngineService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [EngineService],
    }).compile();
    engine = module.get(EngineService);
  });

  it('executes pwd', () => {
    const result = engine.run({
      inputLine: 'pwd',
      vfs: makeVfs(),
      cwd: '/home/dojo',
      checks: NO_CHECKS,
      constraints: {},
    });
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('/home/dojo');
    expect(result.cwdAfter).toBe('/home/dojo');
  });

  it('executes cd to an existing directory', () => {
    const result = engine.run({
      inputLine: 'cd /home',
      vfs: makeVfs(),
      cwd: '/home/dojo',
      checks: NO_CHECKS,
      constraints: {},
    });
    expect(result.exitCode).toBe(0);
    expect(result.cwdAfter).toBe('/home');
  });

  it('cd to nonexistent directory returns exit 1', () => {
    const result = engine.run({
      inputLine: 'cd /nonexistent',
      vfs: makeVfs(),
      cwd: '/home/dojo',
      checks: NO_CHECKS,
      constraints: {},
    });
    expect(result.exitCode).toBe(1);
    expect(result.cwdAfter).toBe('/home/dojo');
  });

  it('mkdir creates a directory', () => {
    const result = engine.run({
      inputLine: 'mkdir projects',
      vfs: makeVfs(),
      cwd: '/home/dojo',
      checks: NO_CHECKS,
      constraints: {},
    });
    expect(result.exitCode).toBe(0);
    expect(vfsResolve(result.vfsAfter, '/home/dojo/projects')?.type).toBe('dir');
  });

  it('echo with overwrite redirect writes to VFS', () => {
    const result = engine.run({
      inputLine: 'echo hello > /home/dojo/out.txt',
      vfs: makeVfs(),
      cwd: '/home/dojo',
      checks: NO_CHECKS,
      constraints: {},
    });
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toBe(''); // stdout consumed by redirect
    expect(vfsResolve(result.vfsAfter, '/home/dojo/out.txt')?.type).toBe('file');
  });

  it('rejects command above input length budget', () => {
    const result = engine.run({
      inputLine: 'a'.repeat(5000),
      vfs: makeVfs(),
      cwd: '/home/dojo',
      checks: NO_CHECKS,
      constraints: {},
    });
    expect(result.exitCode).toBe(1);
    expect(result.trace.budgets.violated).toBe('max_input_length');
  });

  it('rejects disallowed command', () => {
    const result = engine.run({
      inputLine: 'rm somefile',
      vfs: makeVfs(),
      cwd: '/home/dojo',
      checks: NO_CHECKS,
      constraints: { allowedCommands: ['pwd', 'ls'] },
    });
    expect(result.exitCode).toBe(1);
    expect(result.trace.execute.error?.type).toBe('operation_not_allowed');
  });

  it('ls without -a omits hidden files', () => {
    const vfs: VfsSnapshot = {
      root: {
        type: 'dir',
        name: '',
        children: [
          {
            type: 'dir',
            name: 'home',
            children: [
              {
                type: 'dir',
                name: 'dojo',
                children: [
                  { type: 'file', name: 'readme.txt', content: '' },
                  { type: 'file', name: '.profile', content: '' },
                ],
              },
            ],
          },
        ],
      },
    };
    const result = engine.run({
      inputLine: 'ls',
      vfs,
      cwd: '/home/dojo',
      checks: NO_CHECKS,
      constraints: {},
    });

    expect(result.stdout).toContain('readme.txt');
    expect(result.stdout).not.toContain('.profile');
  });

  it('ls -a lists hidden files', () => {
    const vfs: VfsSnapshot = {
      root: {
        type: 'dir',
        name: '',
        children: [
          {
            type: 'dir',
            name: 'home',
            children: [
              {
                type: 'dir',
                name: 'dojo',
                children: [
                  { type: 'file', name: 'readme.txt', content: '' },
                  { type: 'file', name: '.profile', content: '' },
                ],
              },
            ],
          },
        ],
      },
    };
    const result = engine.run({
      inputLine: 'ls -a',
      vfs,
      cwd: '/home/dojo',
      checks: NO_CHECKS,
      constraints: {},
    });

    expect(result.stdout).toContain('readme.txt');
    expect(result.stdout).toContain('.profile');
  });

  it('ls hidden-file path without -a returns error', () => {
    const vfs: VfsSnapshot = {
      root: {
        type: 'dir',
        name: '',
        children: [
          {
            type: 'dir',
            name: 'home',
            children: [
              {
                type: 'dir',
                name: 'dojo',
                children: [{ type: 'file', name: '.secret', content: '' }],
              },
            ],
          },
        ],
      },
    };
    const result = engine.run({
      inputLine: 'ls .secret',
      vfs,
      cwd: '/home/dojo',
      checks: NO_CHECKS,
      constraints: {},
    });

    expect(result.exitCode).toBe(1);
  });

  it('ls -l output contains permission bits', () => {
    const vfs: VfsSnapshot = {
      root: {
        type: 'dir',
        name: '',
        children: [
          {
            type: 'dir',
            name: 'home',
            children: [
              {
                type: 'dir',
                name: 'dojo',
                children: [
                  { type: 'file', name: 'readme.txt', content: 'hello', permissions: '644' },
                ],
              },
            ],
          },
        ],
      },
    };
    const result = engine.run({
      inputLine: 'ls -l',
      vfs,
      cwd: '/home/dojo',
      checks: NO_CHECKS,
      constraints: {},
    });

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('rw-r--r--');
    expect(result.stdout).toContain('readme.txt');
  });

  it('ls -la combines long format and hidden files', () => {
    const vfs: VfsSnapshot = {
      root: {
        type: 'dir',
        name: '',
        children: [
          {
            type: 'dir',
            name: 'home',
            children: [
              {
                type: 'dir',
                name: 'dojo',
                children: [
                  { type: 'file', name: 'readme.txt', content: '', permissions: '644' },
                  { type: 'file', name: '.profile', content: '' },
                ],
              },
            ],
          },
        ],
      },
    };
    const result = engine.run({
      inputLine: 'ls -la',
      vfs,
      cwd: '/home/dojo',
      checks: NO_CHECKS,
      constraints: {},
    });

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('.profile');
    expect(result.stdout).toContain('rw-r--r--');
  });

  it('executes mkdir x && cd x — leaves cwd at /home/dojo/x', () => {
    const result = engine.run({
      inputLine: 'mkdir x && cd x',
      vfs: makeVfs(),
      cwd: '/home/dojo',
      checks: NO_CHECKS,
      constraints: {},
    });
    expect(result.exitCode).toBe(0);
    expect(result.cwdAfter).toBe('/home/dojo/x');
    expect(vfsResolve(result.vfsAfter, '/home/dojo/x')?.type).toBe('dir');
  });

  it('short-circuits on non-zero exit — cd nonexistent && echo hi does not run echo', () => {
    const result = engine.run({
      inputLine: 'cd /nonexistent && echo hi',
      vfs: makeVfs(),
      cwd: '/home/dojo',
      checks: NO_CHECKS,
      constraints: {},
    });
    expect(result.exitCode).toBe(1);
    expect(result.stdout).toBe('');
    expect(result.cwdAfter).toBe('/home/dojo');
  });

  it('echo outputs plain text, not resolved paths', () => {
    const result = engine.run({
      inputLine: 'echo hello world',
      vfs: makeVfs(),
      cwd: '/home/dojo',
      checks: NO_CHECKS,
      constraints: {},
    });
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toBe('hello world\n');
  });

  it('echo with double-quoted string outputs plain text', () => {
    const result = engine.run({
      inputLine: 'echo "Hello mentor"',
      vfs: makeVfs(),
      cwd: '/home/dojo',
      checks: NO_CHECKS,
      constraints: {},
    });
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toBe('Hello mentor\n');
  });

  it('cat nonexistent file returns path_not_found, not permission error', () => {
    const result = engine.run({
      inputLine: 'cat ghost.txt',
      vfs: makeVfs(),
      cwd: '/home/dojo',
      checks: NO_CHECKS,
      constraints: {},
    });

    expect(result.exitCode).toBe(1);
    expect(result.trace.execute.error?.type).toBe('path_not_found');
  });

  it('cat file with permissions 000 returns operation_not_allowed', () => {
    const vfs: VfsSnapshot = {
      root: {
        type: 'dir',
        name: '',
        children: [
          {
            type: 'dir',
            name: 'home',
            children: [
              {
                type: 'dir',
                name: 'dojo',
                children: [
                  { type: 'file', name: 'protected.txt', content: 'secret', permissions: '000' },
                ],
              },
            ],
          },
        ],
      },
    };
    const result = engine.run({
      inputLine: 'cat protected.txt',
      vfs,
      cwd: '/home/dojo',
      checks: NO_CHECKS,
      constraints: {},
    });

    expect(result.exitCode).toBe(1);
    expect(result.trace.execute.error?.type).toBe('operation_not_allowed');
  });

  it('cat file with permissions 644 returns content', () => {
    const vfs: VfsSnapshot = {
      root: {
        type: 'dir',
        name: '',
        children: [
          {
            type: 'dir',
            name: 'home',
            children: [
              {
                type: 'dir',
                name: 'dojo',
                children: [
                  { type: 'file', name: 'notes.txt', content: 'hello\n', permissions: '644' },
                ],
              },
            ],
          },
        ],
      },
    };
    const result = engine.run({
      inputLine: 'cat notes.txt',
      vfs,
      cwd: '/home/dojo',
      checks: NO_CHECKS,
      constraints: {},
    });

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toBe('hello\n');
  });

  it('chmod 644 sets file permissions', () => {
    const vfs: VfsSnapshot = {
      root: {
        type: 'dir',
        name: '',
        children: [
          {
            type: 'dir',
            name: 'home',
            children: [
              {
                type: 'dir',
                name: 'dojo',
                children: [{ type: 'file', name: 'script.sh', content: '', permissions: '000' }],
              },
            ],
          },
        ],
      },
    };
    const result = engine.run({
      inputLine: 'chmod 644 script.sh',
      vfs,
      cwd: '/home/dojo',
      checks: NO_CHECKS,
      constraints: {},
    });

    expect(result.exitCode).toBe(0);
    const node = vfsResolve(
      result.vfsAfter,
      '/home/dojo/script.sh',
    ) as import('./engine.types').VfsFileNode;
    expect(node.permissions).toBe('644');
  });

  it('chmod with invalid mode returns error', () => {
    const result = engine.run({
      inputLine: 'chmod abc script.sh',
      vfs: makeVfs(),
      cwd: '/home/dojo',
      checks: NO_CHECKS,
      constraints: {},
    });

    expect(result.exitCode).toBe(1);
    expect(result.trace.execute.error?.type).toBe('invalid_arguments');
  });

  it('chmod on nonexistent file returns path_not_found error', () => {
    const result = engine.run({
      inputLine: 'chmod 644 ghost.txt',
      vfs: makeVfs(),
      cwd: '/home/dojo',
      checks: NO_CHECKS,
      constraints: {},
    });

    expect(result.exitCode).toBe(1);
    expect(result.trace.execute.error?.type).toBe('path_not_found');
  });

  it('validates checks after execution', () => {
    const checks: MissionCheck[] = [{ id: 'c1', type: 'exit_code_is', expectedExitCode: 0 }];
    const result = engine.run({
      inputLine: 'pwd',
      vfs: makeVfs(),
      cwd: '/home/dojo',
      checks,
      constraints: {},
    });
    expect(result.validation.type).toBe('validation_ok');
  });

  it('validation fails if check not met', () => {
    const checks: MissionCheck[] = [{ id: 'c1', type: 'cwd_is', expectedPath: '/somewhere/else' }];
    const result = engine.run({
      inputLine: 'pwd',
      vfs: makeVfs(),
      cwd: '/home/dojo',
      checks,
      constraints: {},
    });
    expect(result.validation.type).toBe('validation_failed');
  });
});
