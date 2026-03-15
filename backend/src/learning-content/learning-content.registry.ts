import { LearningContentSource } from './learning-content.types';
import { catMissionLesson } from './modules/cmd-basics/lessons/cat-mission';
import { lsHomeLesson } from './modules/cmd-basics/lessons/ls-home';
import { cmdBasicsModule } from './modules/cmd-basics/module';

export const learningContentSource: LearningContentSource = {
  modules: [cmdBasicsModule],
  lessons: [lsHomeLesson, catMissionLesson],
};
