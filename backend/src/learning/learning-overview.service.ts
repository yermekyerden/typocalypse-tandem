import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LearningContentService } from './learning-content.service';
import {
  LearningOverviewResponse,
  LessonHeuristicStatus,
} from '../learning-content/learning-content.types';

@Injectable()
export class LearningOverviewService {
  constructor(
    private readonly learningContent: LearningContentService,
    private readonly prisma: PrismaService,
  ) {}

  async getUserOverview(userId: string): Promise<LearningOverviewResponse> {
    // Load static ordered curriculum
    const staticOverview = this.learningContent.getOverview();

    // Query only completed attempts with a non-null lessonId for this user.
    // Attempts with lessonId = null predate this migration and are excluded.
    const completedAttempts = await this.prisma.attempt.findMany({
      where: {
        userId,
        status: 'completed',
        lessonId: { not: null },
      },
      select: { lessonId: true },
    });

    // The `lessonId: { not: null }` filter guarantees non-null values; filter
    // defensively to satisfy TypeScript without an unsafe cast.
    const completedLessonIds = new Set(
      completedAttempts.map((a) => a.lessonId).filter((id): id is string => id !== null),
    );

    // Apply the sequential unlock rule:
    //   - completed: user has at least one completed attempt for this lesson
    //   - active: the first lesson that is not completed
    //   - locked: all subsequent lessons after active
    let activeAssigned = false;
    const modules = staticOverview.modules.map((module) => ({
      ...module,
      lessons: module.lessons.map((lesson) => {
        let status: LessonHeuristicStatus;

        if (completedLessonIds.has(lesson.id)) {
          status = 'completed';
        } else if (!activeAssigned) {
          status = 'active';
          activeAssigned = true;
        } else {
          status = 'locked';
        }

        return { ...lesson, status };
      }),
    }));

    return { modules };
  }
}
