import { LessonContentDefinition } from '../../../learning-content.types';

export const cdTrainingLesson: LessonContentDefinition = {
  id: 'cd-training',
  slug: 'cd-training',
  moduleId: 'cmd-basics',
  title: 'Change directory',
  order: 6,
  theoryMarkdown:
    '`cd <directory>` changes your current directory. Use a relative name to move into a subdirectory, or an absolute path starting with `/` to jump anywhere.',
  taskDescription: 'Navigate into the projects directory.',
  hints: ['Run `cd projects` to enter the projects directory.'],
  runtime: {
    expectedCommand: 'cd projects',
  },
};
