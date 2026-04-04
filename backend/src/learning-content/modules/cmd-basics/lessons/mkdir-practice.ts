import { LessonContentDefinition } from '../../../learning-content.types';

export const mkdirPracticeLesson: LessonContentDefinition = {
  id: 'mkdir-practice',
  slug: 'mkdir-practice',
  moduleId: 'cmd-basics',
  title: 'Make a directory',
  order: 8,
  theoryMarkdown:
    '`mkdir <name>` creates a new directory. You can chain commands with `&&` — the second command runs only if the first succeeds.',
  taskDescription: 'Create a practice_arena directory and navigate into it.',
  hints: ['Use `mkdir practice_arena && cd practice_arena`.'],
  runtime: {
    expectedCommand: 'mkdir practice_arena && cd practice_arena',
  },
};
