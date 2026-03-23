import { Injectable, NotFoundException } from '@nestjs/common';
import {
  LearningLessonDetailResponse,
  LearningOverviewResponse,
} from '../learning-content/learning-content.types';
import { learningContentSource } from '../learning-content/learning-content.registry';
import { loadLearningContent } from './learning-content.loader';

@Injectable()
export class LearningContentService {
  private readonly loadedContent = loadLearningContent(learningContentSource);

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
}
