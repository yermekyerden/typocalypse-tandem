import type { LessonAttemptScenario } from '../../learning-content/learning-content.types';
import type { VfsSnapshot } from '../../engine/engine.types';

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

export const cmdBasicsScenarios: Record<string, LessonAttemptScenario> = {
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
