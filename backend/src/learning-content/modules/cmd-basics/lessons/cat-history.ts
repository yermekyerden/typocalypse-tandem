import { LessonContentDefinition } from '../../../learning-content.types';

export const catHistoryLesson: LessonContentDefinition = {
  id: 'cat-history',
  slug: 'cat-history',
  moduleId: 'cmd-basics',
  title: 'Read bash history',
  order: 7,
  theoryMarkdown:
    'Bash records commands you run in `.bash_history`. Reading it lets you review what was executed in a session.',
  taskDescription: 'Display the contents of the .bash_history file.',
  hints: ['Use `cat .bash_history` to read the history file.'],
  runtime: {
    expectedCommand: 'cat .bash_history',
  },
};
