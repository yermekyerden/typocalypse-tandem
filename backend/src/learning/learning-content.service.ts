import { Injectable, NotFoundException } from '@nestjs/common';
import {
  LessonAttemptScenario,
  LessonRuntime,
  LearningLessonDetailResponse,
  LearningOverviewResponse,
} from '../learning-content/learning-content.types';
import { learningContentSource } from '../learning-content/learning-content.registry';
import { loadLearningContent } from './learning-content.loader';
import { getLessonAttemptScenario } from './lesson-terminal-scenarios';

@Injectable()
export class LearningContentService {
  private readonly loadedContent = loadLearningContent(learningContentSource);

  getOverview(): LearningOverviewResponse {
    return this.loadedContent.overview;
  }

  getLessonById(lessonId: string): LearningLessonDetailResponse {
    return { lesson: this.getLessonDetailOrThrow(lessonId) };
  }

  getLessonDetailOrThrow(lessonId: string) {
    const lesson = this.loadedContent.lessonDetailsById.get(lessonId);
    if (!lesson) {
      throw new NotFoundException(`Lesson "${lessonId}" was not found`);
    }

    return lesson;
  }

  getLessonRuntimeOrThrow(lessonId: string): LessonRuntime {
    const lesson = this.getLessonDetailOrThrow(lessonId);
    if (!lesson.runtime) {
      throw new NotFoundException(`Lesson runtime was not found for lesson "${lessonId}"`);
    }

    return lesson.runtime;
  }

  getLessonAttemptScenarioOrThrow(lessonId: string): LessonAttemptScenario {
    this.getLessonDetailOrThrow(lessonId);

    const scenario = getLessonAttemptScenario(lessonId);
    if (!scenario) {
      throw new NotFoundException(
        `Lesson terminal scenario was not configured for lesson "${lessonId}"`,
      );
    }

    return scenario;
  }
}
