import { LessonContentDefinition } from '../../../learning-content.types';

export const archiveHistoryLesson: LessonContentDefinition = {
  id: 'archive-history',
  slug: 'archive-history',
  moduleId: 'fs-basics',
  title: 'Read history with an absolute path',
  order: 6,
  theoryMarkdown:
    'Combining what you know: use an absolute path to read any file from any location, like `.bash_history` in the home directory.',
  taskDescription: 'Read .bash_history using its absolute path.',
  hints: ['Use `cat /home/dojo/.bash_history`.'],
  runtime: {
    expectedCommand: 'cat /home/dojo/.bash_history',
  },
};
