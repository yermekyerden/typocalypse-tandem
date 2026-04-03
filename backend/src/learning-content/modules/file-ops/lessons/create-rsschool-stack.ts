import { LessonContentDefinition } from '../../../learning-content.types';

export const createRsschoolStackLesson: LessonContentDefinition = {
  id: 'create-rsschool-stack',
  slug: 'create-rsschool-stack',
  moduleId: 'file-ops',
  title: 'Append to a file',
  order: 6,
  theoryMarkdown:
    '`echo "text" >> file.txt` **appends** to a file instead of overwriting it. This is useful for building up a file line by line.',
  taskDescription: 'Append "Node.js" to stack.txt.',
  hints: ['Use `echo "Node.js" >> stack.txt`.'],
  runtime: {
    expectedCommand: 'echo "Node.js" >> stack.txt',
  },
};
