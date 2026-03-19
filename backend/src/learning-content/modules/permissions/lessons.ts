import { LessonContentDefinition } from '../../learning-content.types';

export const lsPermsLesson: LessonContentDefinition = {
  id: 'ls-perms',
  slug: 'ls-perms',
  moduleId: 'permissions',
  title: 'Identify file owner',
  order: 1,
  theoryMarkdown:
    '`ls -l` shows permissions, links, owner, and group. Key columns: perms, links, owner, group, size, date, name.',
  taskDescription: 'Find the owner of rsstage1.txt.',
  runtime: {
    expectedCommand: 'ls -l',
  },
};

export const chmodOwnerLesson: LessonContentDefinition = {
  id: 'chmod-owner',
  slug: 'chmod-owner',
  moduleId: 'permissions',
  title: 'Attempt to read file',
  order: 2,
  theoryMarkdown: 'If you lack read permission, `cat` will return Permission denied.',
  taskDescription: 'Try to read rsstage1.txt and note the denial.',
  runtime: {
    expectedCommand: 'cat rsstage1.txt',
  },
};

export const catProtectedLesson: LessonContentDefinition = {
  id: 'cat-protected',
  slug: 'cat-protected',
  moduleId: 'permissions',
  title: 'Change permissions',
  order: 3,
  theoryMarkdown:
    'Permissions have three triplets (owner/group/other). Numeric: r=4, w=2, x=1. 6=rw, 0=---.',
  taskDescription: 'Grant owner read+write and remove others for rsstage1.txt.',
  runtime: {
    expectedCommand: 'chmod 600 rsstage1.txt',
  },
};

export const lsCheckLesson: LessonContentDefinition = {
  id: 'ls-check',
  slug: 'ls-check',
  moduleId: 'permissions',
  title: 'Verify changes',
  order: 4,
  theoryMarkdown: 'After `chmod`, verify bits with `ls -l`.',
  taskDescription: 'Check rsstage1.txt permissions after chmod 600.',
  runtime: {
    expectedCommand: 'ls -l rsstage1.txt',
  },
};

export const catAfterLesson: LessonContentDefinition = {
  id: 'cat-after',
  slug: 'cat-after',
  moduleId: 'permissions',
  title: 'Read file again',
  order: 5,
  theoryMarkdown: 'With `rw` for owner set, reading the file should work.',
  taskDescription: 'Read rsstage1.txt now that permissions are updated.',
  runtime: {
    expectedCommand: 'cat rsstage1.txt',
  },
};

export const permissionsLessons: LessonContentDefinition[] = [
  lsPermsLesson,
  chmodOwnerLesson,
  catProtectedLesson,
  lsCheckLesson,
  catAfterLesson,
];
