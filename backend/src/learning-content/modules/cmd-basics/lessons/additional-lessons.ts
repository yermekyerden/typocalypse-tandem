import { LessonContentDefinition } from '../../../learning-content.types';

export const lsHiddenLesson: LessonContentDefinition = {
  id: 'ls-hidden',
  slug: 'ls-hidden',
  moduleId: 'cmd-basics',
  title: 'Hidden files',
  order: 3,
  theoryMarkdown:
    'Files that start with a dot (`.`) are hidden by default. Use `ls -a` to show all files.',
  taskDescription: 'Show all files, including hidden ones.',
  runtime: {
    expectedCommand: 'ls -a',
  },
};

export const catHiddenLesson: LessonContentDefinition = {
  id: 'cat-hidden',
  slug: 'cat-hidden',
  moduleId: 'cmd-basics',
  title: 'Read hidden file .secret_note',
  order: 4,
  theoryMarkdown: 'A hidden file opens the same way as a regular one.',
  taskDescription: 'Show the contents of .secret_note.',
  runtime: {
    expectedCommand: 'cat .secret_note',
  },
};

export const pwdLesson: LessonContentDefinition = {
  id: 'pwd',
  slug: 'pwd',
  moduleId: 'cmd-basics',
  title: 'Find current directory',
  order: 5,
  theoryMarkdown: 'The `pwd` command prints the absolute path of the current directory.',
  taskDescription: 'Determine which directory you are in now.',
  runtime: {
    expectedCommand: 'pwd',
  },
};

export const cdTrainingLesson: LessonContentDefinition = {
  id: 'cd-training',
  slug: 'cd-training',
  moduleId: 'cmd-basics',
  title: 'Change to training_zone',
  order: 6,
  theoryMarkdown: 'The `cd` command changes the current working directory.',
  taskDescription: 'Switch to the training_zone directory.',
  runtime: {
    expectedCommand: 'cd training_zone',
  },
};

export const catHistoryLesson: LessonContentDefinition = {
  id: 'cat-history',
  slug: 'cat-history',
  moduleId: 'cmd-basics',
  title: 'Read history.txt',
  order: 7,
  theoryMarkdown:
    'The `training_zone` directory contains `history.txt` with a Unix history fact.',
  taskDescription: 'Display the contents of history.txt.',
  runtime: {
    expectedCommand: 'cat history.txt',
  },
};

export const mkdirPracticeLesson: LessonContentDefinition = {
  id: 'mkdir-practice',
  slug: 'mkdir-practice',
  moduleId: 'cmd-basics',
  title: 'Create directory practice_arena',
  order: 8,
  theoryMarkdown: 'The `mkdir` command creates a new directory.',
  taskDescription: 'Create practice_arena, then cd into it.',
  runtime: {
    expectedCommand: 'mkdir practice_arena && cd practice_arena',
  },
};

export const touchFirstTaskLesson: LessonContentDefinition = {
  id: 'touch-first-task',
  slug: 'touch-first-task',
  moduleId: 'cmd-basics',
  title: 'Create file first_task.txt',
  order: 9,
  theoryMarkdown: 'The `touch` command creates an empty file if it does not exist.',
  taskDescription: 'Inside practice_arena, create first_task.txt and make sure it appears.',
  runtime: {
    expectedCommand: 'touch first_task.txt',
  },
};
