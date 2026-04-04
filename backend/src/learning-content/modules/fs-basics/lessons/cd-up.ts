import { LessonContentDefinition } from '../../../learning-content.types';

export const cdUpLesson: LessonContentDefinition = {
  id: 'cd-up',
  slug: 'cd-up',
  moduleId: 'fs-basics',
  title: 'Navigate up one level',
  order: 4,
  theoryMarkdown:
    '`..` refers to the parent directory. `cd ..` moves you one level up toward the filesystem root.',
  taskDescription: 'Move one directory level up from projects to /home/dojo.',
  hints: ['Use `cd ..` to go to the parent directory.'],
  runtime: {
    expectedCommand: 'cd ..',
  },
};
