import { LessonContentDefinition } from '../../../learning-content.types';

export const lsCheckLesson: LessonContentDefinition = {
  id: 'ls-check',
  slug: 'ls-check',
  moduleId: 'permissions',
  title: 'Check permissions',
  order: 4,
  theoryMarkdown:
    'Use `ls -l` with a filename to inspect the permissions of a specific file without listing the whole directory.',
  taskDescription: 'Check the permissions of protected.txt.',
  hints: ['Use `ls -l protected.txt`.'],
  runtime: {
    expectedCommand: 'ls -l protected.txt',
  },
};
