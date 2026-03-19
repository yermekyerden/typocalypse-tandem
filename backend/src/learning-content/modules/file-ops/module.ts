import { ModuleContentDefinition } from '../../learning-content.types';

export const fileOpsModule: ModuleContentDefinition = {
  id: 'file-ops',
  slug: 'file-ops',
  title: 'Working with Files',
  description:
    'Edit text files, write via terminal, display contents, and create multi-line files with redirection.',
  order: 4,
  lessonIds: [
    'nano-rsschool-notes',
    'cat-rsschool-notes',
    'echo-mentor-message',
    'cat-create-journey',
    'cat-rsschool-journey',
    'create-rsschool-stack',
  ],
};
