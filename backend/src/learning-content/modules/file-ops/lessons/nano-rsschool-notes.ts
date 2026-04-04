import { LessonContentDefinition } from '../../../learning-content.types';

export const nanoRsschoolNotesLesson: LessonContentDefinition = {
  id: 'nano-rsschool-notes',
  slug: 'nano-rsschool-notes',
  moduleId: 'file-ops',
  title: 'Create a notes file',
  order: 1,
  theoryMarkdown:
    '`nano` is a terminal text editor. In this environment we simulate the outcome: use `touch notes.txt` to create a new empty file, as you would before opening it in nano.',
  taskDescription: 'Create an empty notes.txt file.',
  hints: ['Use `touch notes.txt`.'],
  runtime: {
    expectedCommand: 'touch notes.txt',
  },
};
