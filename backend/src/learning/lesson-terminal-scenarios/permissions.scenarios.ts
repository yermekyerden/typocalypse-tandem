import type { LessonAttemptScenario } from '../../learning-content/learning-content.types';
import type { VfsSnapshot } from '../../engine/engine.types';

function makePermissionsBaseFs(mode = '200'): VfsSnapshot {
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
              name: 'student',
              children: [
                {
                  type: 'file',
                  name: 'rsstage1.txt',
                  content:
                    'RS School students level up by practicing terminal skills every day.\n',
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

export const permissionsScenarios: Record<string, LessonAttemptScenario> = {
  'ls-perms': {
    initialCwd: '/home/student',
    initialFs: makePermissionsBaseFs(),
    allowedCommands: ['ls', 'help'],
    checks: [
      { id: 'ls-perms-exit', type: 'exit_code_is', expectedExitCode: 0 },
      {
        id: 'ls-perms-output-owner',
        type: 'output_contains',
        stream: 'stdout',
        text: 'student',
      },
      {
        id: 'ls-perms-output-file',
        type: 'output_contains',
        stream: 'stdout',
        text: 'rsstage1.txt',
      },
    ],
  },
  'chmod-owner': {
    initialCwd: '/home/student',
    initialFs: makePermissionsBaseFs(),
    allowedCommands: ['cat', 'ls', 'help'],
    checks: [
      { id: 'chmod-owner-exit', type: 'exit_code_is', expectedExitCode: 1 },
      {
        id: 'chmod-owner-denied',
        type: 'output_contains',
        stream: 'stderr',
        text: 'Permission denied',
      },
    ],
  },
  'cat-protected': {
    initialCwd: '/home/student',
    initialFs: makePermissionsBaseFs(),
    allowedCommands: ['chmod', 'ls', 'help'],
    checks: [
      { id: 'cat-protected-exit', type: 'exit_code_is', expectedExitCode: 0 },
      {
        id: 'cat-protected-mode',
        type: 'path_mode_is',
        path: '/home/student/rsstage1.txt',
        expectedMode: '600',
      },
      {
        id: 'cat-protected-file-readable',
        type: 'file_content_matches',
        path: '/home/student/rsstage1.txt',
        expected: { pattern: 'RS School students level up' },
      },
    ],
  },
  'ls-check': {
    initialCwd: '/home/student',
    initialFs: makePermissionsBaseFs('600'),
    allowedCommands: ['ls', 'help'],
    checks: [
      { id: 'ls-check-exit', type: 'exit_code_is', expectedExitCode: 0 },
      {
        id: 'ls-check-mode',
        type: 'output_contains',
        stream: 'stdout',
        text: '-rw-------',
      },
      {
        id: 'ls-check-file',
        type: 'output_contains',
        stream: 'stdout',
        text: 'rsstage1.txt',
      },
    ],
  },
  'cat-after': {
    initialCwd: '/home/student',
    initialFs: makePermissionsBaseFs('600'),
    allowedCommands: ['cat', 'ls', 'help'],
    checks: [
      { id: 'cat-after-exit', type: 'exit_code_is', expectedExitCode: 0 },
      {
        id: 'cat-after-output',
        type: 'output_contains',
        stream: 'stdout',
        text: 'RS School students level up by practicing terminal skills every day.',
      },
    ],
  },
};
