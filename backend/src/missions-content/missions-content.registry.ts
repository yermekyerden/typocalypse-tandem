import { MissionContentSource } from './missions-content.types';
/* eslint-disable @typescript-eslint/no-require-imports */

// ch-01-basics (9 missions)

const ch01m01 = require('./missions/ch-01-basics/ch01-m01-list-home.mission.json') as unknown;

const ch01m02 = require('./missions/ch-01-basics/ch01-m02-cat-mission.mission.json') as unknown;

const ch01m03 = require('./missions/ch-01-basics/ch01-m03-ls-hidden.mission.json') as unknown;

const ch01m04 = require('./missions/ch-01-basics/ch01-m04-cat-hidden.mission.json') as unknown;

const ch01m05 = require('./missions/ch-01-basics/ch01-m05-pwd.mission.json') as unknown;

const ch01m06 = require('./missions/ch-01-basics/ch01-m06-cd-training.mission.json') as unknown;

const ch01m07 = require('./missions/ch-01-basics/ch01-m07-cat-history.mission.json') as unknown;

const ch01m08 = require('./missions/ch-01-basics/ch01-m08-mkdir-practice.mission.json') as unknown;

const ch01m09 =
  require('./missions/ch-01-basics/ch01-m09-touch-first-task.mission.json') as unknown;

// ch-02-fs-basics (6 missions)

const ch02m01 = require('./missions/ch-02-fs-basics/ch02-m01-cd-abs.mission.json') as unknown;

const ch02m02 = require('./missions/ch-02-fs-basics/ch02-m02-cd-rel.mission.json') as unknown;

const ch02m03 = require('./missions/ch-02-fs-basics/ch02-m03-archive-read.mission.json') as unknown;

const ch02m04 = require('./missions/ch-02-fs-basics/ch02-m04-cd-up.mission.json') as unknown;

const ch02m05 = require('./missions/ch-02-fs-basics/ch02-m05-cd-multi-up.mission.json') as unknown;

const ch02m06 =
  require('./missions/ch-02-fs-basics/ch02-m06-archive-history.mission.json') as unknown;

// ch-03-permissions (5 missions)

const ch03m01 = require('./missions/ch-03-permissions/ch03-m01-ls-perms.mission.json') as unknown;

const ch03m02 =
  require('./missions/ch-03-permissions/ch03-m02-chmod-owner.mission.json') as unknown;

const ch03m03 =
  require('./missions/ch-03-permissions/ch03-m03-cat-protected.mission.json') as unknown;

const ch03m04 = require('./missions/ch-03-permissions/ch03-m04-ls-check.mission.json') as unknown;

const ch03m05 = require('./missions/ch-03-permissions/ch03-m05-cat-after.mission.json') as unknown;

// ch-04-file-ops (6 missions)

const ch04m01 =
  require('./missions/ch-04-file-ops/ch04-m01-nano-rsschool-notes.mission.json') as unknown;

const ch04m02 =
  require('./missions/ch-04-file-ops/ch04-m02-cat-rsschool-notes.mission.json') as unknown;

const ch04m03 =
  require('./missions/ch-04-file-ops/ch04-m03-echo-mentor-message.mission.json') as unknown;

const ch04m04 =
  require('./missions/ch-04-file-ops/ch04-m04-cat-create-journey.mission.json') as unknown;

const ch04m05 =
  require('./missions/ch-04-file-ops/ch04-m05-cat-rsschool-journey.mission.json') as unknown;

const ch04m06 =
  require('./missions/ch-04-file-ops/ch04-m06-create-rsschool-stack.mission.json') as unknown;

export const missionContentSource: MissionContentSource = {
  missions: [
    ch01m01,
    ch01m02,
    ch01m03,
    ch01m04,
    ch01m05,
    ch01m06,
    ch01m07,
    ch01m08,
    ch01m09,
    ch02m01,
    ch02m02,
    ch02m03,
    ch02m04,
    ch02m05,
    ch02m06,
    ch03m01,
    ch03m02,
    ch03m03,
    ch03m04,
    ch03m05,
    ch04m01,
    ch04m02,
    ch04m03,
    ch04m04,
    ch04m05,
    ch04m06,
  ] as MissionContentSource['missions'],
};
/* eslint-enable @typescript-eslint/no-require-imports */
