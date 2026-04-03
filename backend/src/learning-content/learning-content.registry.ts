import { LearningContentSource } from './learning-content.types';

// cmd-basics
import { catMissionLesson } from './modules/cmd-basics/lessons/cat-mission';
import { lsHomeLesson } from './modules/cmd-basics/lessons/ls-home';
import { lsHiddenLesson } from './modules/cmd-basics/lessons/ls-hidden';
import { catHiddenLesson } from './modules/cmd-basics/lessons/cat-hidden';
import { pwdLesson } from './modules/cmd-basics/lessons/pwd';
import { cdTrainingLesson } from './modules/cmd-basics/lessons/cd-training';
import { catHistoryLesson } from './modules/cmd-basics/lessons/cat-history';
import { mkdirPracticeLesson } from './modules/cmd-basics/lessons/mkdir-practice';
import { touchFirstTaskLesson } from './modules/cmd-basics/lessons/touch-first-task';
import { cmdBasicsModule } from './modules/cmd-basics/module';

// fs-basics
import { cdAbsLesson } from './modules/fs-basics/lessons/cd-abs';
import { cdRelLesson } from './modules/fs-basics/lessons/cd-rel';
import { archiveReadLesson } from './modules/fs-basics/lessons/archive-read';
import { cdUpLesson } from './modules/fs-basics/lessons/cd-up';
import { cdMultiUpLesson } from './modules/fs-basics/lessons/cd-multi-up';
import { archiveHistoryLesson } from './modules/fs-basics/lessons/archive-history';
import { fsBasicsModule } from './modules/fs-basics/module';

// permissions
import { lsPermsLesson } from './modules/permissions/lessons/ls-perms';
import { chmodOwnerLesson } from './modules/permissions/lessons/chmod-owner';
import { catProtectedLesson } from './modules/permissions/lessons/cat-protected';
import { lsCheckLesson } from './modules/permissions/lessons/ls-check';
import { catAfterLesson } from './modules/permissions/lessons/cat-after';
import { permissionsModule } from './modules/permissions/module';

// file-ops
import { nanoRsschoolNotesLesson } from './modules/file-ops/lessons/nano-rsschool-notes';
import { catRsschoolNotesLesson } from './modules/file-ops/lessons/cat-rsschool-notes';
import { echoMentorMessageLesson } from './modules/file-ops/lessons/echo-mentor-message';
import { catCreateJourneyLesson } from './modules/file-ops/lessons/cat-create-journey';
import { catRsschoolJourneyLesson } from './modules/file-ops/lessons/cat-rsschool-journey';
import { createRsschoolStackLesson } from './modules/file-ops/lessons/create-rsschool-stack';
import { fileOpsModule } from './modules/file-ops/module';

export const learningContentSource: LearningContentSource = {
  modules: [cmdBasicsModule, fsBasicsModule, permissionsModule, fileOpsModule],
  lessons: [
    // cmd-basics (order 1–9)
    lsHomeLesson,
    catMissionLesson,
    lsHiddenLesson,
    catHiddenLesson,
    pwdLesson,
    cdTrainingLesson,
    catHistoryLesson,
    mkdirPracticeLesson,
    touchFirstTaskLesson,
    // fs-basics (order 1–6)
    cdAbsLesson,
    cdRelLesson,
    archiveReadLesson,
    cdUpLesson,
    cdMultiUpLesson,
    archiveHistoryLesson,
    // permissions (order 1–5)
    lsPermsLesson,
    chmodOwnerLesson,
    catProtectedLesson,
    lsCheckLesson,
    catAfterLesson,
    // file-ops (order 1–6)
    nanoRsschoolNotesLesson,
    catRsschoolNotesLesson,
    echoMentorMessageLesson,
    catCreateJourneyLesson,
    catRsschoolJourneyLesson,
    createRsschoolStackLesson,
  ],
};
