import { LessonContentDefinition } from '../../../learning-content.types';

export const lsPermsLesson: LessonContentDefinition = {
  id: 'ls-perms',
  slug: 'ls-perms',
  moduleId: 'permissions',
  title: 'List with permissions',
  order: 1,
  theoryMarkdown:
    '`ls -l` shows the long listing format, which includes permission bits like `rw-r--r--`, owner, size, and name for each entry.',
  taskDescription: 'Show the detailed listing of the home directory with permissions.',
  hints: ['Use `ls -l` to see permissions.'],
  runtime: {
    expectedCommand: 'ls -l',
  },
};
