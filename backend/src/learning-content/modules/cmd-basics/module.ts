import { ModuleContentDefinition } from '../../learning-content.types';

export const cmdBasicsModule: ModuleContentDefinition = {
  id: 'cmd-basics',
  slug: 'cmd-basics',
  title: 'Command Line Basics',
  description: 'Navigate directories, list contents, read files, first steps with cd/ls/pwd.',
  order: 1,
  lessonIds: [
    'ls-home',
    'cat-mission',
    'ls-hidden',
    'cat-hidden',
    'pwd',
    'cd-training',
    'cat-history',
    'mkdir-practice',
    'touch-first-task',
  ],
};
