import { Injectable, NotFoundException } from '@nestjs/common';
import {
  LearningLessonDetailResponse,
  LearningOverviewResponse,
} from '../learning-content/learning-content.types';
import { learningContentSource } from '../learning-content/learning-content.registry';
import {
  LESSON_MISSION_ENTRIES,
  validateLessonMissionMapping,
} from '../learning-content/lesson-mission-mapping';
import { missionContentSource } from '../missions-content/missions-content.registry';
import { loadMissionsContent } from '../missions-content/missions-content.loader';
import { loadLearningContent } from './learning-content.loader';

@Injectable()
export class LearningContentService {
  private readonly loadedContent = loadLearningContent(learningContentSource);

  constructor() {
    const knownLessonIds = new Set(this.loadedContent.lessonDetailsById.keys());
    const loadedMissions = loadMissionsContent(missionContentSource);
    const knownMissionIds = new Set(loadedMissions.missionById.keys());
    validateLessonMissionMapping(LESSON_MISSION_ENTRIES, knownLessonIds, knownMissionIds);
  }

  getOverview(): LearningOverviewResponse {
    return this.loadedContent.overview;
  }

  getLessonById(lessonId: string): LearningLessonDetailResponse {
    const lesson = this.loadedContent.lessonDetailsById.get(lessonId);
    if (!lesson) {
      throw new NotFoundException(`Lesson "${lessonId}" was not found`);
    }

    return { lesson };
  }

  getLessonIds(): ReadonlySet<string> {
    return new Set(this.loadedContent.lessonDetailsById.keys());
  }
}
