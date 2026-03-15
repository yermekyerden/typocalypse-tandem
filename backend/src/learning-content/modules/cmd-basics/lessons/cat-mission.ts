import { LessonContentDefinition } from '../../../learning-content.types';

export const catMissionLesson: LessonContentDefinition = {
  id: 'cat-mission',
  slug: 'cat-mission',
  moduleId: 'cmd-basics',
  title: 'Read mission.txt',
  order: 2,
  theoryMarkdown: 'Use `cat` to print the full contents of a file to standard output.',
  taskDescription: 'Display the contents of mission.txt.',
  hints: ['Try `ls` first if you are not sure the file exists.'],
  runtime: {
    expectedCommand: 'cat mission.txt',
  },
};
