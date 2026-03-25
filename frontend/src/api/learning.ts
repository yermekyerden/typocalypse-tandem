import { apiRequest } from '@/api/client';
import type { LearningLessonDetail, LearningModule } from '@/features/learning/types';

type LearningOverviewResponse = {
  modules: LearningModule[];
};

type LearningLessonDetailResponse = {
  lesson: LearningLessonDetail;
};

export function getLearningOverview() {
  return apiRequest<LearningOverviewResponse>('/learning/overview', undefined, {
    requiresAuth: true,
  });
}

export function getLessonById(lessonId: string) {
  return apiRequest<LearningLessonDetailResponse>(`/lessons/${lessonId}`, undefined, {
    requiresAuth: true,
  });
}
