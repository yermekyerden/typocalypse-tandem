import { CommandExecution } from '../../engine.types';
import { CommandHandler } from '../command-handler.types';

const HELP_TEXT = `Available commands:
  pwd          Print working directory
  ls [-a]      List directory contents
  cd [path]    Change directory
  cat file     Print file contents
  echo [text]  Print text (supports > and >> redirect)
  mkdir dir    Create directory
  touch file   Create empty file
  rm file      Remove file
  help         Show this help message
`;

export const helpHandler: CommandHandler = (_args, vfs, cwd): CommandExecution => ({
  stdout: HELP_TEXT,
  stderr: '',
  exitCode: 0,
  vfsAfter: vfs,
  cwdAfter: cwd,
  effects: [],
});
