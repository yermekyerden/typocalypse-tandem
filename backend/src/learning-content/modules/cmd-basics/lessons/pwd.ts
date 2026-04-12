import { LessonContentDefinition } from '../../../learning-content.types';

export const pwdLesson: LessonContentDefinition = {
  id: 'pwd',
  slug: 'pwd',
  moduleId: 'cmd-basics',
  title: 'Print working directory',
  order: 5,
  theoryMarkdown:
    '`pwd` prints the **absolute path** of the current directory — your exact location in the file system tree.',
  taskDescription: 'Print your current working directory path.',
  hints: ['Type `pwd` and press Enter.'],
  runtime: {
    expectedCommand: 'pwd',
  },
};
