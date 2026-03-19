import type { LessonAttemptScenario } from '../learning-content/learning-content.types';
import type { VfsSnapshot } from '../engine/engine.types';

function makeCmdBasicsBaseFs(): VfsSnapshot {
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
                  name: 'mission.txt',
                  content:
                    'Welcome to Terminal Dojo.\nYour mission begins here.\n\nComplete each task step by step.\n',
                },
                {
                  type: 'file',
                  name: '.secret_note',
                  content: 'The real skill is paying attention.\n',
                },
                {
                  type: 'dir',
                  name: 'training_zone',
                  children: [
                    {
                      type: 'file',
                      name: 'history.txt',
                      content:
                        'The Unix operating system was created in 1969 at Bell Labs.\n',
                    },
                  ],
                },
                {
                  type: 'file',
                  name: 'notes.md',
                  content: '# Notes\n- draft\n',
                },
              ],
            },
          ],
        },
      ],
    },
  };
}

function makePracticeArenaFs(): VfsSnapshot {
  const base = makeCmdBasicsBaseFs();
  const student = base.root.children[0];
  if (student.type !== 'dir') {
    return base;
  }

  const homeStudent = student.children[0];
  if (homeStudent.type !== 'dir') {
    return base;
  }

  const trainingZone = homeStudent.children.find(
    (node) => node.type === 'dir' && node.name === 'training_zone',
  );

  if (trainingZone?.type === 'dir') {
    trainingZone.children.push({
      type: 'dir',
      name: 'practice_arena',
      children: [],
    });
  }

  return base;
}

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

function makeFileOpsBaseFs(): VfsSnapshot {
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
                  name: 'rsschool_notes.txt',
                  content: 'Daily practice log\n',
                },
              ],
            },
          ],
        },
      ],
    },
  };
}

function makeFileOpsNotesReadyFs(): VfsSnapshot {
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
                  name: 'rsschool_notes.txt',
                  content: 'Daily practice log\nRS School The best!\n',
                },
              ],
            },
          ],
        },
      ],
    },
  };
}

function makeJourneyReadyFs(): VfsSnapshot {
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
                  name: 'rsschool_notes.txt',
                  content: 'Daily practice log\n',
                },
                {
                  type: 'file',
                  name: 'rsschool_journey.txt',
                  content: 'JavaScript\nFrontend\nRS School\n',
                },
              ],
            },
          ],
        },
      ],
    },
  };
}

const CMD_BASICS_SCENARIOS: Record<string, LessonAttemptScenario> = {
  'ls-home': {
    initialCwd: '/home/student',
    initialFs: makeCmdBasicsBaseFs(),
    allowedCommands: ['ls', 'help'],
    checks: [
      { id: 'ls-home-exit', type: 'exit_code_is', expectedExitCode: 0 },
      {
        id: 'ls-home-output',
        type: 'output_contains',
        stream: 'stdout',
        text: 'mission.txt',
      },
    ],
  },
  'cat-mission': {
    initialCwd: '/home/student',
    initialFs: makeCmdBasicsBaseFs(),
    allowedCommands: ['ls', 'cat', 'help'],
    checks: [
      { id: 'cat-mission-exit', type: 'exit_code_is', expectedExitCode: 0 },
      {
        id: 'cat-mission-output',
        type: 'output_contains',
        stream: 'stdout',
        text: 'Welcome to Terminal Dojo.',
      },
    ],
  },
  'ls-hidden': {
    initialCwd: '/home/student',
    initialFs: makeCmdBasicsBaseFs(),
    allowedCommands: ['ls', 'help'],
    checks: [
      { id: 'ls-hidden-exit', type: 'exit_code_is', expectedExitCode: 0 },
      {
        id: 'ls-hidden-output',
        type: 'output_contains',
        stream: 'stdout',
        text: '.secret_note',
      },
    ],
  },
  'cat-hidden': {
    initialCwd: '/home/student',
    initialFs: makeCmdBasicsBaseFs(),
    allowedCommands: ['cat', 'ls', 'help'],
    checks: [
      { id: 'cat-hidden-exit', type: 'exit_code_is', expectedExitCode: 0 },
      {
        id: 'cat-hidden-output',
        type: 'output_contains',
        stream: 'stdout',
        text: 'The real skill is paying attention.',
      },
    ],
  },
  pwd: {
    initialCwd: '/home/student',
    initialFs: makeCmdBasicsBaseFs(),
    allowedCommands: ['pwd', 'help'],
    checks: [
      { id: 'pwd-exit', type: 'exit_code_is', expectedExitCode: 0 },
      {
        id: 'pwd-output',
        type: 'output_contains',
        stream: 'stdout',
        text: '/home/student',
      },
    ],
  },
  'cd-training': {
    initialCwd: '/home/student',
    initialFs: makeCmdBasicsBaseFs(),
    allowedCommands: ['cd', 'ls', 'pwd', 'help'],
    checks: [
      { id: 'cd-training-exit', type: 'exit_code_is', expectedExitCode: 0 },
      { id: 'cd-training-cwd', type: 'cwd_is', expectedPath: '/home/student/training_zone' },
    ],
  },
  'cat-history': {
    initialCwd: '/home/student/training_zone',
    initialFs: makeCmdBasicsBaseFs(),
    allowedCommands: ['cat', 'ls', 'help'],
    checks: [
      { id: 'cat-history-exit', type: 'exit_code_is', expectedExitCode: 0 },
      {
        id: 'cat-history-output',
        type: 'output_contains',
        stream: 'stdout',
        text: 'The Unix operating system was created in 1969 at Bell Labs.',
      },
    ],
  },
  'mkdir-practice': {
    initialCwd: '/home/student/training_zone',
    initialFs: makeCmdBasicsBaseFs(),
    allowedCommands: ['mkdir', 'cd', 'ls', 'help'],
    checks: [
      { id: 'mkdir-practice-exit', type: 'exit_code_is', expectedExitCode: 0 },
      {
        id: 'mkdir-practice-dir',
        type: 'path_exists',
        path: '/home/student/training_zone/practice_arena',
        expectedKind: 'dir',
      },
      {
        id: 'mkdir-practice-cwd',
        type: 'cwd_is',
        expectedPath: '/home/student/training_zone/practice_arena',
      },
    ],
  },
  'touch-first-task': {
    initialCwd: '/home/student/training_zone/practice_arena',
    initialFs: makePracticeArenaFs(),
    allowedCommands: ['touch', 'ls', 'help'],
    checks: [
      { id: 'touch-first-task-exit', type: 'exit_code_is', expectedExitCode: 0 },
      {
        id: 'touch-first-task-file',
        type: 'path_exists',
        path: '/home/student/training_zone/practice_arena/first_task.txt',
        expectedKind: 'file',
      },
    ],
  },
};

const FS_BASICS_SCENARIOS: Record<string, LessonAttemptScenario> = {
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

const PERMISSIONS_SCENARIOS: Record<string, LessonAttemptScenario> = {
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

const FILE_OPS_SCENARIOS: Record<string, LessonAttemptScenario> = {
  'nano-rsschool-notes': {
    initialCwd: '/home/student',
    initialFs: makeFileOpsBaseFs(),
    allowedCommands: ['echo', 'cat', 'help'],
    checks: [
      { id: 'nano-rsschool-notes-exit', type: 'exit_code_is', expectedExitCode: 0 },
      {
        id: 'nano-rsschool-notes-content',
        type: 'file_content_matches',
        path: '/home/student/rsschool_notes.txt',
        expected: { pattern: 'RS School The best!' },
      },
    ],
  },
  'cat-rsschool-notes': {
    initialCwd: '/home/student',
    initialFs: makeFileOpsNotesReadyFs(),
    allowedCommands: ['cat', 'help'],
    checks: [
      { id: 'cat-rsschool-notes-exit', type: 'exit_code_is', expectedExitCode: 0 },
      {
        id: 'cat-rsschool-notes-output',
        type: 'output_contains',
        stream: 'stdout',
        text: 'RS School The best!',
      },
    ],
  },
  'echo-mentor-message': {
    initialCwd: '/home/student',
    initialFs: makeFileOpsBaseFs(),
    allowedCommands: ['echo', 'cat', 'help'],
    checks: [
      { id: 'echo-mentor-message-exit', type: 'exit_code_is', expectedExitCode: 0 },
      {
        id: 'echo-mentor-message-file',
        type: 'file_content_equals',
        path: '/home/student/mentor-message.txt',
        expectedText: 'Keep learning every day\n',
      },
    ],
  },
  'cat-create-journey': {
    initialCwd: '/home/student',
    initialFs: makeFileOpsBaseFs(),
    allowedCommands: ['echo', 'cat', 'help'],
    checks: [
      { id: 'cat-create-journey-exit', type: 'exit_code_is', expectedExitCode: 0 },
      {
        id: 'cat-create-journey-file',
        type: 'file_content_equals',
        path: '/home/student/rsschool_journey.txt',
        expectedText: 'JavaScript\nFrontend\nRS School\n',
      },
    ],
  },
  'cat-rsschool-journey': {
    initialCwd: '/home/student',
    initialFs: makeJourneyReadyFs(),
    allowedCommands: ['wc', 'cat', 'help'],
    checks: [
      { id: 'cat-rsschool-journey-exit', type: 'exit_code_is', expectedExitCode: 0 },
      {
        id: 'cat-rsschool-journey-output',
        type: 'output_contains',
        stream: 'stdout',
        text: '3 rsschool_journey.txt',
      },
    ],
  },
  'create-rsschool-stack': {
    initialCwd: '/home/student',
    initialFs: makeFileOpsBaseFs(),
    allowedCommands: ['echo', 'cat', 'help'],
    checks: [
      { id: 'create-rsschool-stack-exit', type: 'exit_code_is', expectedExitCode: 0 },
      {
        id: 'create-rsschool-stack-file',
        type: 'file_content_equals',
        path: '/home/student/rsschool_stack.txt',
        expectedText: 'HTML\nCSS\nJavaScript\nGit\n',
      },
    ],
  },
};

export function getLessonAttemptScenario(lessonId: string): LessonAttemptScenario | null {
  return (
    CMD_BASICS_SCENARIOS[lessonId] ??
    FS_BASICS_SCENARIOS[lessonId] ??
    PERMISSIONS_SCENARIOS[lessonId] ??
    FILE_OPS_SCENARIOS[lessonId] ??
    null
  );
}
