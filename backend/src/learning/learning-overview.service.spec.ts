import { LearningOverviewService } from './learning-overview.service';
import { LearningOverviewResponse } from '../learning-content/learning-content.types';

// Static curriculum: two lessons across one module
const STATIC_OVERVIEW: LearningOverviewResponse = {
  modules: [
    {
      id: 'mod-1',
      slug: 'mod-1',
      title: 'Module 1',
      description: 'First module',
      order: 1,
      lessons: [
        { id: 'lesson-a', slug: 'lesson-a', title: 'Lesson A', order: 1, status: 'active' },
        { id: 'lesson-b', slug: 'lesson-b', title: 'Lesson B', order: 2, status: 'locked' },
      ],
    },
  ],
};

function makeMockLearningContent(overview = STATIC_OVERVIEW) {
  return { getOverview: jest.fn().mockReturnValue(overview) };
}

function makeMockPrisma(completedLessonIds: Array<string | null> = []) {
  return {
    attempt: {
      findMany: jest.fn().mockResolvedValue(completedLessonIds.map((lessonId) => ({ lessonId }))),
    },
  };
}

function makeService(completedLessonIds: Array<string | null> = []) {
  return new LearningOverviewService(
    makeMockLearningContent() as never,
    makeMockPrisma(completedLessonIds) as never,
  );
}

describe('LearningOverviewService.getUserOverview', () => {
  it('marks first lesson as active when no completed attempts', async () => {
    const service = makeService([]);
    const result = await service.getUserOverview('user-1');

    const lessons = result.modules[0]?.lessons ?? [];
    expect(lessons[0]?.status).toBe('active');
    expect(lessons[1]?.status).toBe('locked');
  });

  it('marks completed lessons from attempt data and advances active', async () => {
    const service = makeService(['lesson-a']);
    const result = await service.getUserOverview('user-1');

    const lessons = result.modules[0]?.lessons ?? [];
    expect(lessons[0]?.status).toBe('completed');
    expect(lessons[1]?.status).toBe('active');
  });

  it('excludes legacy attempts where lessonId is null', async () => {
    // null entries should not count as completions
    const service = makeService([null, null]);
    const result = await service.getUserOverview('user-1');

    const lessons = result.modules[0]?.lessons ?? [];
    expect(lessons[0]?.status).toBe('active');
    expect(lessons[1]?.status).toBe('locked');
  });

  it('produces exactly one active lesson in the sequential rule', async () => {
    const service = makeService([]);
    const result = await service.getUserOverview('user-1');

    const allLessons = result.modules.flatMap((m) => m.lessons);
    const activeCount = allLessons.filter((l) => l.status === 'active').length;
    expect(activeCount).toBe(1);
  });

  it('returns all statuses as completed with no active lesson when all are done', async () => {
    const service = makeService(['lesson-a', 'lesson-b']);
    const result = await service.getUserOverview('user-1');

    const lessons = result.modules[0]?.lessons ?? [];
    expect(lessons.every((l) => l.status === 'completed')).toBe(true);

    const allLessons = result.modules.flatMap((m) => m.lessons);
    expect(allLessons.some((l) => l.status === 'active')).toBe(false);
  });
});
