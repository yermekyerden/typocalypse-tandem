import { LessonContentDefinition } from '../../../learning-content.types';

export const catRsschoolNotesLesson: LessonContentDefinition = {
  id: 'cat-rsschool-notes',
  slug: 'cat-rsschool-notes',
  moduleId: 'file-ops',
  title: 'Display your notes',
  order: 2,
  theoryMarkdown:
    'After writing notes, `cat notes.txt` lets you review what you recorded. Reading is always the first verification step.',
  taskDescription: 'Display the contents of notes.txt.',
  hints: ['Use `cat notes.txt`.'],
  runtime: {
    expectedCommand: 'cat notes.txt',
  },
};
