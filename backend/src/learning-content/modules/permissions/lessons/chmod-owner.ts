import { LessonContentDefinition } from '../../../learning-content.types';

export const chmodOwnerLesson: LessonContentDefinition = {
  id: 'chmod-owner',
  slug: 'chmod-owner',
  moduleId: 'permissions',
  title: 'Change file permissions',
  order: 2,
  theoryMarkdown:
    '`chmod <mode> <file>` changes file permissions. Numeric mode uses three octal digits: owner, group, others. `755` gives owner full access, group and others read+execute.',
  taskDescription: 'Make script.sh executable by changing its permissions to 755.',
  hints: ['Use `chmod 755 script.sh`.'],
  runtime: {
    expectedCommand: 'chmod 755 script.sh',
  },
};
