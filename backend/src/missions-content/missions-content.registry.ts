import { MissionContentSource } from './missions-content.types';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const ch01m01 = require('./missions/ch-01-basics/ch01-m01-print-cwd.mission.json') as unknown;
// eslint-disable-next-line @typescript-eslint/no-require-imports
const ch01m02 = require('./missions/ch-01-basics/ch01-m02-create-dirs.mission.json') as unknown;

export const missionContentSource: MissionContentSource = {
  missions: [ch01m01, ch01m02] as MissionContentSource['missions'],
};
