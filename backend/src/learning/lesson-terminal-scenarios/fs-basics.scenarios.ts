import type { LessonAttemptScenario } from '../../learning-content/learning-content.types';
import type { VfsSnapshot } from '../../engine/engine.types';

function makeFsBasicsBaseFs(): VfsSnapshot {
  return {
    root: {
      type: 'dir',
      name: '',
      children: [
        {
          type: 'dir',
          name: 'var',
          children: [
            {
              type: 'dir',
              name: 'tmp',
              children: [
                {
                  type: 'dir',
                  name: 'rsschool',
                  children: [
                    {
                      type: 'dir',
                      name: 'stage1',
                      children: [
                        {
                          type: 'file',
                          name: 'intro.txt',
                          content:
                            'Welcome to stage1.\nRelative paths help you move step by step.\n',
                        },
                      ],
                    },
                    {
                      type: 'dir',
                      name: 'stage2',
                      children: [
                        {
                          type: 'file',
                          name: 'checkpoint.txt',
                          content: 'You reached stage2.\n',
                        },
                      ],
                    },
                    {
                      type: 'file',
                      name: 'map.txt',
                      content: 'stage1\nstage2\n',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  };
}

export const fsBasicsScenarios: Record<string, LessonAttemptScenario> = {
  'cd-abs': {
    initialCwd: '/home/student',
    initialFs: makeFsBasicsBaseFs(),
    allowedCommands: ['cd', 'pwd', 'ls', 'help'],
    checks: [
      { id: 'cd-abs-exit', type: 'exit_code_is', expectedExitCode: 0 },
      { id: 'cd-abs-cwd', type: 'cwd_is', expectedPath: '/var/tmp/rsschool' },
    ],
  },
  'cd-rel': {
    initialCwd: '/var/tmp/rsschool',
    initialFs: makeFsBasicsBaseFs(),
    allowedCommands: ['ls', 'help'],
    checks: [
      { id: 'cd-rel-exit', type: 'exit_code_is', expectedExitCode: 0 },
      {
        id: 'cd-rel-output-stage1',
        type: 'output_contains',
        stream: 'stdout',
        text: 'stage1/',
      },
      {
        id: 'cd-rel-output-stage2',
        type: 'output_contains',
        stream: 'stdout',
        text: 'stage2/',
      },
    ],
  },
  'archive-read': {
    initialCwd: '/var/tmp/rsschool',
    initialFs: makeFsBasicsBaseFs(),
    allowedCommands: ['cd', 'cat', 'ls', 'help'],
    checks: [
      { id: 'archive-read-exit', type: 'exit_code_is', expectedExitCode: 0 },
      { id: 'archive-read-cwd', type: 'cwd_is', expectedPath: '/var/tmp/rsschool/stage1' },
      {
        id: 'archive-read-output',
        type: 'output_contains',
        stream: 'stdout',
        text: 'Welcome to stage1.',
      },
    ],
  },
  'cd-up': {
    initialCwd: '/var/tmp/rsschool/stage1',
    initialFs: makeFsBasicsBaseFs(),
    allowedCommands: ['cd', 'pwd', 'ls', 'help'],
    checks: [
      { id: 'cd-up-exit', type: 'exit_code_is', expectedExitCode: 0 },
      { id: 'cd-up-cwd', type: 'cwd_is', expectedPath: '/var/tmp/rsschool' },
    ],
  },
  'cd-multi-up': {
    initialCwd: '/var/tmp/rsschool',
    initialFs: makeFsBasicsBaseFs(),
    allowedCommands: ['cd', 'pwd', 'ls', 'help'],
    checks: [
      { id: 'cd-multi-up-exit', type: 'exit_code_is', expectedExitCode: 0 },
      { id: 'cd-multi-up-cwd', type: 'cwd_is', expectedPath: '/var/tmp/rsschool/stage2' },
    ],
  },
  'archive-history': {
    initialCwd: '/var/tmp/rsschool/stage2',
    initialFs: makeFsBasicsBaseFs(),
    allowedCommands: ['cd', 'pwd', 'ls', 'help'],
    checks: [
      { id: 'archive-history-exit', type: 'exit_code_is', expectedExitCode: 0 },
      { id: 'archive-history-cwd', type: 'cwd_is', expectedPath: '/var/tmp' },
    ],
  },
};
