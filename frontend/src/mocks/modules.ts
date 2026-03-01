export type LessonStatus = 'locked' | 'active' | 'completed';

export type Lesson = {
  id: string;
  title: string;
  order: number;
  status: LessonStatus;
  theory: string;
  task: string;
  expectedCommand: string;
  sampleOutput?: string;
};

export type Module = {
  id: string;
  title: string;
  description: string;
  order: number;
  lessons: Lesson[];
};

export const modules: Module[] = [
  {
    id: 'cmd-basics',
    title: 'Command Line Basics',
    description:
      'Navigate directories, list contents, read files, first steps with cd/ls/pwd.',
    order: 1,
    lessons: [
      {
        id: 'ls-home',
        title: 'Step 1 — List home directory',
        order: 1,
        status: 'active',
        theory:
          'The ls command prints files and folders in the current directory. By default you start in your home directory.',
        task: 'Print the list of files in your home directory.',
        expectedCommand: 'ls',
      },
      {
        id: 'cat-mission',
        title: 'Step 2 — Read mission.txt',
        order: 2,
        status: 'locked',
        theory: 'cat prints the contents of a file.',
        task: 'Display the contents of mission.txt.',
        expectedCommand: 'cat mission.txt',
      },
      {
        id: 'ls-hidden',
        title: 'Step 3 — Hidden files (ls -a)',
        order: 3,
        status: 'locked',
        theory:
          'Files that start with a dot (.) are hidden by default. Use ls -a to show all files.',
        task: 'Show all files, including hidden ones.',
        expectedCommand: 'ls -a',
      },
      {
        id: 'cat-hidden',
        title: 'Step 4 — Read hidden file .secret_note',
        order: 4,
        status: 'locked',
        theory: 'A hidden file opens the same way as a regular one.',
        task: 'Show the contents of .secret_note.',
        expectedCommand: 'cat .secret_note',
      },
      {
        id: 'pwd',
        title: 'Step 5 — Find current directory',
        order: 5,
        status: 'locked',
        theory: 'pwd prints the absolute path of the current directory.',
        task: 'Determine which directory you are in now.',
        expectedCommand: 'pwd',
      },
      {
        id: 'cd-training',
        title: 'Step 6 — Change to training_zone',
        order: 6,
        status: 'locked',
        theory: 'cd changes the current working directory.',
        task: 'Switch to the training_zone directory.',
        expectedCommand: 'cd training_zone',
      },
      {
        id: 'cat-history',
        title: 'Step 7 — Read history.txt',
        order: 7,
        status: 'locked',
        theory:
          'The training_zone directory contains history.txt with a Unix history fact.',
        task: 'Display the contents of history.txt.',
        expectedCommand: 'cat history.txt',
      },
      {
        id: 'mkdir-practice',
        title: 'Step 8 — Create directory practice_arena',
        order: 8,
        status: 'locked',
        theory: 'mkdir creates a new directory.',
        task: 'Create practice_arena, then cd into it.',
        expectedCommand: 'mkdir practice_arena && cd practice_arena',
      },
      {
        id: 'touch-first-task',
        title: 'Step 9 — Create file first_task.txt',
        order: 9,
        status: 'locked',
        theory: 'touch creates an empty file if it does not exist.',
        task: 'Inside practice_arena, create first_task.txt and make sure it appears.',
        expectedCommand: 'touch first_task.txt',
      },
    ],
  },
  {
    id: 'fs-basics',
    title: 'File System Paths',
    description:
      'Absolute vs relative paths, moving between levels, reading files in different folders.',
    order: 2,
    lessons: [
      {
        id: 'cd-abs',
        title: 'Step 1 — Absolute path',
        order: 1,
        status: 'active',
        theory:
          'An absolute path always starts with / and points to the full route from the filesystem root.',
        task: 'Change to /var/tmp/rsschool using an absolute path.',
        expectedCommand: 'cd /var/tmp/rsschool',
      },
      {
        id: 'cd-rel',
        title: 'Step 2 — List directory contents',
        order: 2,
        status: 'locked',
        theory: 'Use ls to list the current directory.',
        task: 'List the contents of /var/tmp/rsschool.',
        expectedCommand: 'ls',
      },
      {
        id: 'archive-read',
        title: 'Step 3 — Relative path to stage1',
        order: 3,
        status: 'locked',
        theory:
          'Relative paths are built from the current directory and do not start with /.',
        task: 'Change to stage1 using a relative path, then display intro.txt.',
        expectedCommand: 'cd stage1 && cat intro.txt',
      },
      {
        id: 'cd-up',
        title: 'Step 4 — Go up one level',
        order: 4,
        status: 'locked',
        theory: '.. refers to the parent directory.',
        task: 'Go one level up from stage1.',
        expectedCommand: 'cd ..',
      },
      {
        id: 'cd-multi-up',
        title: 'Step 5 — Go up multiple levels',
        order: 5,
        status: 'locked',
        theory: 'Using ../ repeatedly lets you climb multiple levels.',
        task: 'From /var/tmp/rsschool/stage2, go to /var/tmp using a relative path.',
        expectedCommand: 'cd ../../',
      },
      {
        id: 'archive-history',
        title: 'Step 6 — Work with archive',
        order: 6,
        status: 'locked',
        theory: 'Combine relative paths to move into archive content.',
        task: 'Go to rsschool/archive and display history.txt.',
        expectedCommand: 'cd rsschool/archive && cat history.txt',
      },
    ],
  },
  {
    id: 'permissions',
    title: 'Permissions',
    description: 'Read and change permissions, chmod in symbolic and numeric forms.',
    order: 3,
    lessons: [
      {
        id: 'ls-perms',
        title: 'Step 1 — Identify file owner',
        order: 1,
        status: 'active',
        theory:
          'ls -l shows permissions, links, owner, and group. Key columns: perms, links, owner, group, size, date, name.',
        task: 'Find the owner of rsstage1.txt in permissions_lab.',
        expectedCommand: 'ls -l',
      },
      {
        id: 'chmod-owner',
        title: 'Step 2 — Attempt to read file',
        order: 2,
        status: 'locked',
        theory: 'If you lack read permission, cat will return Permission denied.',
        task: 'Try to read rsstage1.txt and note the denial.',
        expectedCommand: 'cat rsstage1.txt',
      },
      {
        id: 'cat-protected',
        title: 'Step 3 — Change permissions',
        order: 3,
        status: 'locked',
        theory:
          'Permissions have three triplets (owner/group/other). Numeric: r=4, w=2, x=1. 6=rw, 0=---.',
        task: 'Grant owner read+write and remove others for rsstage1.txt.',
        expectedCommand: 'chmod 600 rsstage1.txt',
      },
      {
        id: 'ls-check',
        title: 'Step 4 — Verify changes',
        order: 4,
        status: 'locked',
        theory: 'After chmod, verify bits with ls -l.',
        task: 'Check rsstage1.txt permissions after chmod 600.',
        expectedCommand: 'ls -l rsstage1.txt',
      },
      {
        id: 'cat-after',
        title: 'Step 5 — Read file again',
        order: 5,
        status: 'locked',
        theory: 'With rw for owner set, reading the file should work.',
        task: 'Read rsstage1.txt now that permissions are updated.',
        expectedCommand: 'cat rsstage1.txt',
      },
    ],
  },
];
