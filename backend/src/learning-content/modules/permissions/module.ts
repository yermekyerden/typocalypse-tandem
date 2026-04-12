import { ModuleContentDefinition } from '../../learning-content.types';

export const permissionsModule: ModuleContentDefinition = {
  id: 'permissions',
  slug: 'permissions',
  title: 'Permissions',
  description: 'Read and change file permissions with chmod in symbolic and numeric forms.',
  order: 3,
  lessonIds: ['ls-perms', 'chmod-owner', 'cat-protected', 'ls-check', 'cat-after'],
};
