import { LessonContentDefinition } from '../../../learning-content.types';

export const lsHomeLesson: LessonContentDefinition = {
  id: 'ls-home',
  slug: 'ls-home',
  moduleId: 'cmd-basics',
  title: 'List home directory',
  order: 1,
  theoryMarkdown:
    'The `ls` command prints files and folders in the current directory. By default you start in the home directory.',
  taskDescription: 'Print the list of files in your home directory.',
  runtime: {
    expectedCommand: 'ls',
  },
};
