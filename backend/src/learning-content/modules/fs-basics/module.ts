import { ModuleContentDefinition } from '../../learning-content.types';

export const fsBasicsModule: ModuleContentDefinition = {
  id: 'fs-basics',
  slug: 'fs-basics',
  title: 'File System Paths',
  description:
    'Absolute vs relative paths, moving between directory levels, reading files in different locations.',
  order: 2,
  lessonIds: ['cd-abs', 'cd-rel', 'archive-read', 'cd-up', 'cd-multi-up', 'archive-history'],
};
