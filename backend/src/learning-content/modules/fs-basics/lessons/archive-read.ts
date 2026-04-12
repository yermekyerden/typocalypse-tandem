import { LessonContentDefinition } from '../../../learning-content.types';

export const archiveReadLesson: LessonContentDefinition = {
  id: 'archive-read',
  slug: 'archive-read',
  moduleId: 'fs-basics',
  title: 'Read from a subdirectory',
  order: 3,
  theoryMarkdown:
    'You can read files in any directory without changing into it by providing an absolute or relative path to `cat`.',
  taskDescription: 'Display the contents of /home/dojo/projects/notes.txt.',
  hints: ['Use `cat /home/dojo/projects/notes.txt` or `cat projects/notes.txt`.'],
  runtime: {
    expectedCommand: 'cat /home/dojo/projects/notes.txt',
  },
};
