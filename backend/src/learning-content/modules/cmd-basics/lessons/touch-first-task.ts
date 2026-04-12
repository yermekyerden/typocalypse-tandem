import { LessonContentDefinition } from '../../../learning-content.types';

export const touchFirstTaskLesson: LessonContentDefinition = {
  id: 'touch-first-task',
  slug: 'touch-first-task',
  moduleId: 'cmd-basics',
  title: 'Create your first file',
  order: 9,
  theoryMarkdown:
    '`touch <filename>` creates an empty file if it does not exist, or updates the modification timestamp if it does.',
  taskDescription: 'Create an empty file named first.txt.',
  hints: ['Use `touch first.txt`.'],
  runtime: {
    expectedCommand: 'touch first.txt',
  },
};
