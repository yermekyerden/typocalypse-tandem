import { LessonContentDefinition } from '../../../learning-content.types';

export const cdMultiUpLesson: LessonContentDefinition = {
  id: 'cd-multi-up',
  slug: 'cd-multi-up',
  moduleId: 'fs-basics',
  title: 'Navigate multiple levels up',
  order: 5,
  theoryMarkdown:
    'You can chain `..` segments: `../..` goes two levels up. `cd ../..` from `/home/dojo/projects/src` would land you at `/home/dojo`.',
  taskDescription: 'Move two directory levels up from /home/dojo/projects/src.',
  hints: ['Use `cd ../..` to go up two levels.'],
  runtime: {
    expectedCommand: 'cd ../..',
  },
};
