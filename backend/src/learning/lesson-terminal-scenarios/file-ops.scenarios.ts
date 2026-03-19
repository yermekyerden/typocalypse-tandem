import type { LessonAttemptScenario } from '../../learning-content/learning-content.types';
import type { VfsSnapshot } from '../../engine/engine.types';

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

export const fileOpsScenarios: Record<string, LessonAttemptScenario> = {
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
