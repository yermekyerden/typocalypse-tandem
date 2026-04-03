import { LessonContentDefinition } from '../../../learning-content.types';

export const lsHiddenLesson: LessonContentDefinition = {
  id: 'ls-hidden',
  slug: 'ls-hidden',
  moduleId: 'cmd-basics',
  title: 'List hidden files',
  order: 3,
  theoryMarkdown:
    'Files and directories whose names start with `.` are hidden by default. Use `ls -a` to show them all, including hidden entries.',
  taskDescription: 'List all files including hidden ones in your home directory.',
  hints: ['Try `ls -a` to include hidden files.'],
  runtime: {
    expectedCommand: 'ls -a',
  },
};
