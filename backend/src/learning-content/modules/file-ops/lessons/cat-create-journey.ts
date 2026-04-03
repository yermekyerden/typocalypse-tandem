import { LessonContentDefinition } from '../../../learning-content.types';

export const catCreateJourneyLesson: LessonContentDefinition = {
  id: 'cat-create-journey',
  slug: 'cat-create-journey',
  moduleId: 'file-ops',
  title: 'Create a file with redirection',
  order: 4,
  theoryMarkdown:
    '`echo "text" > file.txt` redirects the output of `echo` into a file, creating or overwriting it. This is one of the most common ways to write text files from the shell.',
  taskDescription: 'Create journey.txt with the content "Started".',
  hints: ['Use `echo "Started" > journey.txt`.'],
  runtime: {
    expectedCommand: 'echo "Started" > journey.txt',
  },
};
