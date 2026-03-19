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

function makePermissionsVfs(mode = '200'): VfsSnapshot {
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
              children: [
                {
                  type: 'file',
                  name: 'rsstage1.txt',
                  content: 'protected lesson text\n',
                  metadata: {
                    owner: 'student',
                    group: 'dojo',
                    mode,
                  },
                },
              ],
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

  it('executes chained commands in sequence', () => {
    const result = engine.run({
      inputLine: 'mkdir projects && cd projects',
      vfs: makeVfs(),
      cwd: '/home/dojo',
      checks: NO_CHECKS,
      constraints: {},
    });

    expect(result.exitCode).toBe(0);
    expect(result.cwdAfter).toBe('/home/dojo/projects');
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

  it('denies cat when read permission is missing', () => {
    const result = engine.run({
      inputLine: 'cat rsstage1.txt',
      vfs: makePermissionsVfs(),
      cwd: '/home/dojo',
      checks: NO_CHECKS,
      constraints: {},
    });

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain('Permission denied');
  });

  it('supports chmod with numeric mode and allows reading afterwards', () => {
    const result = engine.run({
      inputLine: 'chmod 600 rsstage1.txt && cat rsstage1.txt',
      vfs: makePermissionsVfs(),
      cwd: '/home/dojo',
      checks: NO_CHECKS,
      constraints: {},
    });

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('protected lesson text');
  });

  it('renders ls -l with symbolic permissions and owner', () => {
    const result = engine.run({
      inputLine: 'ls -l rsstage1.txt',
      vfs: makePermissionsVfs('600'),
      cwd: '/home/dojo',
      checks: NO_CHECKS,
      constraints: {},
    });

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('-rw-------');
    expect(result.stdout).toContain('student');
    expect(result.stdout).toContain('rsstage1.txt');
  });

  it('supports wc -l for counting file lines', () => {
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
                  {
                    type: 'file',
                    name: 'journey.txt',
                    content: 'JavaScript\nFrontend\nRS School\n',
                  },
                ],
              },
            ],
          },
        ],
      },
    };

    const result = engine.run({
      inputLine: 'wc -l journey.txt',
      vfs,
      cwd: '/home/dojo',
      checks: NO_CHECKS,
      constraints: {},
    });

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('3 journey.txt');
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
