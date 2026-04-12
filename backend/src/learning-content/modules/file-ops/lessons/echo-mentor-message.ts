import { LessonContentDefinition } from '../../../learning-content.types';

export const echoMentorMessageLesson: LessonContentDefinition = {
  id: 'echo-mentor-message',
  slug: 'echo-mentor-message',
  moduleId: 'file-ops',
  title: 'Echo a message',
  order: 3,
  theoryMarkdown:
    '`echo` prints text to the terminal. Quote your message to preserve spaces and special characters.',
  taskDescription: 'Print the message "Hello mentor" to the terminal.',
  hints: ['Use `echo "Hello mentor"`.'],
  runtime: {
    expectedCommand: 'echo "Hello mentor"',
  },
};
