import { LessonContentDefinition } from '../../learning-content.types';

export const cdAbsLesson: LessonContentDefinition = {
  id: 'cd-abs',
  slug: 'cd-abs',
  moduleId: 'fs-basics',
  title: 'Absolute path',
  order: 1,
  theoryMarkdown:
    'An absolute path always starts with `/` and points to the full route from the filesystem root.',
  taskDescription: 'Change to /var/tmp/rsschool using an absolute path.',
  runtime: {
    expectedCommand: 'cd /var/tmp/rsschool',
    expectedCwd: '/var/tmp/rsschool',
  },
};

export const cdRelLesson: LessonContentDefinition = {
  id: 'cd-rel',
  slug: 'cd-rel',
  moduleId: 'fs-basics',
  title: 'List directory contents',
  order: 2,
  theoryMarkdown: 'Use `ls` to list the current directory.',
  taskDescription: 'List the contents of /var/tmp/rsschool.',
  runtime: {
    expectedCommand: 'ls',
    expectedCwd: '/var/tmp/rsschool',
  },
};

export const archiveReadLesson: LessonContentDefinition = {
  id: 'archive-read',
  slug: 'archive-read',
  moduleId: 'fs-basics',
  title: 'Relative path to stage1',
  order: 3,
  theoryMarkdown:
    'Relative paths are built from the current directory and do not start with `/`.',
  taskDescription: 'Change to stage1 using a relative path, then display intro.txt.',
  runtime: {
    expectedCommand: 'cd stage1 && cat intro.txt',
    expectedCwd: '/var/tmp/rsschool/stage1',
  },
};

export const cdUpLesson: LessonContentDefinition = {
  id: 'cd-up',
  slug: 'cd-up',
  moduleId: 'fs-basics',
  title: 'Go up one level',
  order: 4,
  theoryMarkdown: '`..` refers to the parent directory.',
  taskDescription: 'Go one level up from stage1.',
  runtime: {
    expectedCommand: 'cd ..',
    expectedCwd: '/var/tmp/rsschool',
  },
};

export const cdMultiUpLesson: LessonContentDefinition = {
  id: 'cd-multi-up',
  slug: 'cd-multi-up',
  moduleId: 'fs-basics',
  title: 'Go up multiple levels',
  order: 5,
  theoryMarkdown: 'Using `../` repeatedly lets you climb multiple levels.',
  taskDescription: 'Move to stage2 using a relative path.',
  runtime: {
    expectedCommand: 'cd stage2',
    expectedCwd: '/var/tmp/rsschool/stage2',
  },
};

export const archiveHistoryLesson: LessonContentDefinition = {
  id: 'archive-history',
  slug: 'archive-history',
  moduleId: 'fs-basics',
  title: 'Work with archive',
  order: 6,
  theoryMarkdown: 'Combine relative paths to move into archive content.',
  taskDescription: 'From stage2, go two levels up to /var/tmp.',
  runtime: {
    expectedCommand: 'cd ../../',
    expectedCwd: '/var/tmp',
  },
};

export const fsBasicsLessons: LessonContentDefinition[] = [
  cdAbsLesson,
  cdRelLesson,
  archiveReadLesson,
  cdUpLesson,
  cdMultiUpLesson,
  archiveHistoryLesson,
];
