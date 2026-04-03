import { LessonContentDefinition } from '../../../learning-content.types';

export const catProtectedLesson: LessonContentDefinition = {
  id: 'cat-protected',
  slug: 'cat-protected',
  moduleId: 'permissions',
  title: 'Read a protected file',
  order: 3,
  theoryMarkdown:
    'A file with permissions `000` cannot be read by anyone — even the owner. `cat` will return "Permission denied". This exercise shows what that looks like.',
  taskDescription: 'Try to read protected.txt — observe the permission denied error.',
  hints: ['Run `cat protected.txt` and note the error message.'],
  runtime: {
    expectedCommand: 'cat protected.txt',
  },
};
