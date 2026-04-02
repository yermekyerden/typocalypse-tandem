import { LessonContentDefinition } from '../../../learning-content.types';

export const cdRelLesson: LessonContentDefinition = {
  id: 'cd-rel',
  slug: 'cd-rel',
  moduleId: 'fs-basics',
  title: 'Relative paths',
  order: 2,
  theoryMarkdown:
    'A **relative path** is resolved from your current directory. `projects` means "the `projects` entry inside your current location." No leading `/`.',
  taskDescription: 'Navigate into the projects directory using a relative path.',
  hints: ['Use `cd projects` — no leading slash.'],
  runtime: {
    expectedCommand: 'cd projects',
  },
};
