import { LearningContentSource } from './learning-content.types';
import {
  catHistoryLesson,
  cdTrainingLesson,
  catHiddenLesson,
  lsHiddenLesson,
  mkdirPracticeLesson,
  pwdLesson,
  touchFirstTaskLesson,
} from './modules/cmd-basics/lessons/additional-lessons';
import { catMissionLesson } from './modules/cmd-basics/lessons/cat-mission';
import { lsHomeLesson } from './modules/cmd-basics/lessons/ls-home';
import { cmdBasicsModule } from './modules/cmd-basics/module';
import { fileOpsLessons } from './modules/file-ops/lessons';
import { fileOpsModule } from './modules/file-ops/module';
import { fsBasicsLessons } from './modules/fs-basics/lessons';
import { fsBasicsModule } from './modules/fs-basics/module';
import { permissionsLessons } from './modules/permissions/lessons';
import { permissionsModule } from './modules/permissions/module';

export const learningContentSource: LearningContentSource = {
  modules: [cmdBasicsModule, fsBasicsModule, permissionsModule, fileOpsModule],
  lessons: [
    lsHomeLesson,
    catMissionLesson,
    lsHiddenLesson,
    catHiddenLesson,
    pwdLesson,
    cdTrainingLesson,
    catHistoryLesson,
    mkdirPracticeLesson,
    touchFirstTaskLesson,
    ...fsBasicsLessons,
    ...permissionsLessons,
    ...fileOpsLessons,
  ],
};
