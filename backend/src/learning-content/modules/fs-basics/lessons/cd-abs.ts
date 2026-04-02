import { LessonContentDefinition } from '../../../learning-content.types';

export const cdAbsLesson: LessonContentDefinition = {
  id: 'cd-abs',
  slug: 'cd-abs',
  moduleId: 'fs-basics',
  title: 'Absolute paths',
  order: 1,
  theoryMarkdown:
    'An **absolute path** starts with `/` and specifies the full location from the filesystem root, e.g. `/home/dojo/projects`. You can `cd` to any absolute path regardless of where you are now.',
  taskDescription: 'Navigate to /home/dojo/projects using an absolute path.',
  hints: ['Use `cd /home/dojo/projects`.'],
  runtime: {
    expectedCommand: 'cd /home/dojo/projects',
  },
};
