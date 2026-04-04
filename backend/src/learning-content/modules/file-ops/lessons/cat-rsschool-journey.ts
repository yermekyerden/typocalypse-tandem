import { LessonContentDefinition } from '../../../learning-content.types';

export const catRsschoolJourneyLesson: LessonContentDefinition = {
  id: 'cat-rsschool-journey',
  slug: 'cat-rsschool-journey',
  moduleId: 'file-ops',
  title: 'Read your journey file',
  order: 5,
  theoryMarkdown:
    'Verify file creation by reading it back. `cat` is the simplest tool for displaying file contents.',
  taskDescription: 'Display the contents of journey.txt.',
  hints: ['Use `cat journey.txt`.'],
  runtime: {
    expectedCommand: 'cat journey.txt',
  },
};
