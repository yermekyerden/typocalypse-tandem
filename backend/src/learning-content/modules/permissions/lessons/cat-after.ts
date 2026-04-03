import { LessonContentDefinition } from '../../../learning-content.types';

export const catAfterLesson: LessonContentDefinition = {
  id: 'cat-after',
  slug: 'cat-after',
  moduleId: 'permissions',
  title: 'Read after permission change',
  order: 5,
  theoryMarkdown:
    'Once permissions are restored with `chmod 644`, the file becomes readable again. Chain `chmod` and `cat` with `&&` to change permissions and immediately read the file.',
  taskDescription: 'Fix permissions on protected.txt and read it in one command.',
  hints: ['Use `chmod 644 protected.txt && cat protected.txt`.'],
  runtime: {
    expectedCommand: 'chmod 644 protected.txt && cat protected.txt',
  },
};
