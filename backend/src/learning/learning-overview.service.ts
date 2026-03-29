import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LearningContentService } from './learning-content.service';
import {
  LearningOverviewResponse,
  LessonHeuristicStatus,
} from '../learning-content/learning-content.types';
import {
  LESSON_MISSION_ENTRIES,
  LESSON_MISSION_MAP,
} from '../learning-content/lesson-mission-mapping';

// Reverse lookup: missionId → lessonId. Used to resolve pre-migration Attempt
// rows that have a null lessonId but a known missionId.
const MISSION_TO_LESSON_MAP: ReadonlyMap<string, string> = new Map(
  LESSON_MISSION_ENTRIES.map(([lessonId, missionId]) => [missionId, lessonId]),
);

@Injectable()
export class LearningOverviewService {
  constructor(
    private readonly learningContent: LearningContentService,
    private readonly prisma: PrismaService,
  ) {}

  async getUserOverview(userId: string): Promise<LearningOverviewResponse> {
    // Load static ordered curriculum
    const staticOverview = this.learningContent.getOverview();

    // Fetch ALL completed attempts for this user — do not filter by lessonId
    // nullability. Legacy rows (written before the lessonId migration) have
    // lessonId = null but carry missionId, which we resolve via the reverse map.
    const completedAttempts = await this.prisma.attempt.findMany({
      where: { userId, status: 'completed' },
      select: { lessonId: true, missionId: true },
    });

    // Resolve lesson IDs for both new-style and legacy rows:
    //   - new rows:    use lessonId directly
    //   - legacy rows: fall back to MISSION_TO_LESSON_MAP lookup by missionId
    const completedLessonIds = new Set(
      completedAttempts
        .map((a) => a.lessonId ?? MISSION_TO_LESSON_MAP.get(a.missionId))
        .filter((id): id is string => id !== undefined),
    );

    // Sequential unlock rule:
    //   - completed: user has at least one completed attempt for this lesson
    //   - active:    first non-completed lesson that has a mission mapping
    //                (display-only lessons without a mapping are always locked)
    //   - locked:    all remaining lessons
    let activeAssigned = false;
    const modules = staticOverview.modules.map((module) => ({
      ...module,
      lessons: module.lessons.map((lesson) => {
        let status: LessonHeuristicStatus;

        if (completedLessonIds.has(lesson.id)) {
          status = 'completed';
        } else if (!activeAssigned && LESSON_MISSION_MAP.has(lesson.id)) {
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
