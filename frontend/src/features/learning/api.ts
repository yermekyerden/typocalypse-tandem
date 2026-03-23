import { apiRequest } from '@/lib/api';

import type { LearningLessonDetail, LearningModule } from './types';

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
