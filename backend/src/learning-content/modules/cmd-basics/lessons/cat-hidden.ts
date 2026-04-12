import { LessonContentDefinition } from '../../../learning-content.types';

export const catHiddenLesson: LessonContentDefinition = {
  id: 'cat-hidden',
  slug: 'cat-hidden',
  moduleId: 'cmd-basics',
  title: 'Read a hidden file',
  order: 4,
  theoryMarkdown:
    'Hidden files like `.profile` store shell configuration. You can read them with `cat` just like any other file — the leading dot is simply part of the name.',
  taskDescription: 'Display the contents of the hidden .profile file.',
  hints: ['Hidden files start with a dot. Use `cat .profile`.'],
  runtime: {
    expectedCommand: 'cat .profile',
  },
};
