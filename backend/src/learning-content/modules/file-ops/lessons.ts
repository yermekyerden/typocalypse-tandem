import { LessonContentDefinition } from '../../learning-content.types';

export const nanoRsschoolNotesLesson: LessonContentDefinition = {
  id: 'nano-rsschool-notes',
  slug: 'nano-rsschool-notes',
  moduleId: 'file-ops',
  title: 'Edit rsschool_notes.txt',
  order: 1,
  theoryMarkdown:
    'Use `echo` with `>>` to append text to an existing file without overwriting its content.',
  taskDescription: 'Append the line "RS School The best!" to rsschool_notes.txt.',
  runtime: {
    expectedCommand: 'echo "RS School The best!" >> rsschool_notes.txt',
  },
};

export const catRsschoolNotesLesson: LessonContentDefinition = {
  id: 'cat-rsschool-notes',
  slug: 'cat-rsschool-notes',
  moduleId: 'file-ops',
  title: 'Check file contents',
  order: 2,
  theoryMarkdown: '`cat` prints the contents of a file directly to the terminal.',
  taskDescription:
    'Display the contents of rsschool_notes.txt to confirm the new line is present.',
  runtime: {
    expectedCommand: 'cat rsschool_notes.txt',
  },
};

export const echoMentorMessageLesson: LessonContentDefinition = {
  id: 'echo-mentor-message',
  slug: 'echo-mentor-message',
  moduleId: 'file-ops',
  title: 'Write text with echo',
  order: 3,
  theoryMarkdown:
    '`echo` combined with `>` writes text to a file, creating it if it does not exist.',
  taskDescription: 'Create mentor-message.txt containing the line "Keep learning every day".',
  runtime: {
    expectedCommand: 'echo "Keep learning every day" > mentor-message.txt',
  },
};

export const catCreateJourneyLesson: LessonContentDefinition = {
  id: 'cat-create-journey',
  slug: 'cat-create-journey',
  moduleId: 'file-ops',
  title: 'Create a multi-line file',
  order: 4,
  theoryMarkdown:
    'Write multiple lines using successive `echo` commands with `>` for the first line and `>>` to append the rest.',
  taskDescription:
    'Create rsschool_journey.txt with the lines JavaScript, Frontend, RS School (one per line).',
  runtime: {
    expectedCommand:
      'echo "JavaScript" > rsschool_journey.txt && echo "Frontend" >> rsschool_journey.txt && echo "RS School" >> rsschool_journey.txt',
  },
};

export const catRsschoolJourneyLesson: LessonContentDefinition = {
  id: 'cat-rsschool-journey',
  slug: 'cat-rsschool-journey',
  moduleId: 'file-ops',
  title: 'Count lines in rsschool_journey.txt',
  order: 5,
  theoryMarkdown:
    '`wc -l` counts how many lines a file has and prints the count with the filename.',
  taskDescription: 'Count the number of lines in rsschool_journey.txt.',
  runtime: {
    expectedCommand: 'wc -l rsschool_journey.txt',
    sampleOutput: '3 rsschool_journey.txt',
  },
};

export const createRsschoolStackLesson: LessonContentDefinition = {
  id: 'create-rsschool-stack',
  slug: 'create-rsschool-stack',
  moduleId: 'file-ops',
  title: 'Build a tech stack list',
  order: 6,
  theoryMarkdown: 'Use a sequence of `echo` commands to build a short list file.',
  taskDescription:
    'Create rsschool_stack.txt with the lines HTML, CSS, JavaScript, Git (one per line).',
  runtime: {
    expectedCommand:
      'echo "HTML" > rsschool_stack.txt && echo "CSS" >> rsschool_stack.txt && echo "JavaScript" >> rsschool_stack.txt && echo "Git" >> rsschool_stack.txt',
  },
};

export const fileOpsLessons: LessonContentDefinition[] = [
  nanoRsschoolNotesLesson,
  catRsschoolNotesLesson,
  echoMentorMessageLesson,
  catCreateJourneyLesson,
  catRsschoolJourneyLesson,
  createRsschoolStackLesson,
];
