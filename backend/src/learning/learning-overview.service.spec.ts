// Control LESSON_MISSION_MAP and LESSON_MISSION_ENTRIES for all tests in this file.
// lesson-a and lesson-b are startable; lesson-preview is intentionally absent
// so P1 (non-startable skip) tests can use it without adjusting the mock.
jest.mock('../learning-content/lesson-mission-mapping', () => ({
  LESSON_MISSION_ENTRIES: [
    ['lesson-a', 'mission-x'],
    ['lesson-b', 'mission-y'],
  ] as const,
  LESSON_MISSION_MAP: new Map([
    ['lesson-a', 'mission-x'],
    ['lesson-b', 'mission-y'],
  ]),
}));

import { LearningOverviewService } from './learning-overview.service';
import { LearningOverviewResponse } from '../learning-content/learning-content.types';

// ── Fixtures ──────────────────────────────────────────────────────────────────

/** Two-lesson curriculum — both lessons are startable per the mock above. */
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

/**
 * Three-lesson curriculum where the middle lesson has no mission mapping.
 * Used to verify that non-startable lessons are skipped when choosing active.
 */
const THREE_LESSON_OVERVIEW: LearningOverviewResponse = {
  modules: [
    {
      id: 'mod-1',
      slug: 'mod-1',
      title: 'Module 1',
      description: 'First module',
      order: 1,
      lessons: [
        { id: 'lesson-a', slug: 'lesson-a', title: 'Lesson A', order: 1, status: 'active' },
        {
          id: 'lesson-preview',
          slug: 'lesson-preview',
          title: 'Preview (no mission)',
          order: 2,
          status: 'locked',
        },
        { id: 'lesson-b', slug: 'lesson-b', title: 'Lesson B', order: 3, status: 'locked' },
      ],
    },
  ],
};

// ── Helpers ───────────────────────────────────────────────────────────────────

type AttemptRow = { lessonId: string | null; missionId: string };

function makeMockLearningContent(overview: LearningOverviewResponse = STATIC_OVERVIEW) {
  return { getOverview: jest.fn().mockReturnValue(overview) };
}

function makeMockPrisma(rows: AttemptRow[] = []) {
  return {
    attempt: {
      findMany: jest.fn().mockResolvedValue(rows),
    },
  };
}

function makeService(
  rows: AttemptRow[] = [],
  overview: LearningOverviewResponse = STATIC_OVERVIEW,
) {
  return new LearningOverviewService(
    makeMockLearningContent(overview) as never,
    makeMockPrisma(rows) as never,
  );
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('LearningOverviewService.getUserOverview', () => {
  it('marks first startable lesson as active when no completed attempts', async () => {
    const service = makeService([]);
    const result = await service.getUserOverview('user-1');

    const lessons = result.modules[0]?.lessons ?? [];
    expect(lessons[0]?.status).toBe('active');
    expect(lessons[1]?.status).toBe('locked');
  });

  it('marks completed lessons from attempt data and advances active to the next', async () => {
    const service = makeService([{ lessonId: 'lesson-a', missionId: 'mission-x' }]);
    const result = await service.getUserOverview('user-1');

    const lessons = result.modules[0]?.lessons ?? [];
    expect(lessons[0]?.status).toBe('completed');
    expect(lessons[1]?.status).toBe('active');
  });

  it('produces exactly one active lesson in the sequential rule', async () => {
    const service = makeService([]);
    const result = await service.getUserOverview('user-1');

    const allLessons = result.modules.flatMap((m) => m.lessons);
    const activeCount = allLessons.filter((l) => l.status === 'active').length;
    expect(activeCount).toBe(1);
  });

  it('returns all statuses as completed with no active lesson when all are done', async () => {
    const service = makeService([
      { lessonId: 'lesson-a', missionId: 'mission-x' },
      { lessonId: 'lesson-b', missionId: 'mission-y' },
    ]);
    const result = await service.getUserOverview('user-1');

    const lessons = result.modules[0]?.lessons ?? [];
    expect(lessons.every((l) => l.status === 'completed')).toBe(true);

    const allLessons = result.modules.flatMap((m) => m.lessons);
    expect(allLessons.some((l) => l.status === 'active')).toBe(false);
  });

  // ── P1: skip non-startable (display-only) lessons when choosing active ─────

  it('marks display-only lesson locked and promotes the next startable lesson to active', async () => {
    // lesson-a done; lesson-preview has no mission mapping; lesson-b is next startable
    const service = makeService(
      [{ lessonId: 'lesson-a', missionId: 'mission-x' }],
      THREE_LESSON_OVERVIEW,
    );
    const result = await service.getUserOverview('user-1');

    const lessons = result.modules[0]?.lessons ?? [];
    expect(lessons[0]?.status).toBe('completed'); // lesson-a
    expect(lessons[1]?.status).toBe('locked'); // lesson-preview — no mission mapping
    expect(lessons[2]?.status).toBe('active'); // lesson-b — skipped over preview
  });

  it('marks display-only lesson locked even when it is the first non-completed lesson', async () => {
    // No completions; lesson-a is first and startable, so it is active.
    // lesson-preview (non-startable) and lesson-b (after active) are both locked.
    const service = makeService([], THREE_LESSON_OVERVIEW);
    const result = await service.getUserOverview('user-1');

    const lessons = result.modules[0]?.lessons ?? [];
    expect(lessons[0]?.status).toBe('active'); // lesson-a
    expect(lessons[1]?.status).toBe('locked'); // lesson-preview
    expect(lessons[2]?.status).toBe('locked'); // lesson-b — after active
  });

  // ── P2: resolve legacy attempts via missionId reverse-lookup ──────────────

  it('counts a legacy attempt (lessonId=null) via missionId reverse-lookup', async () => {
    // mission-x reverse-maps to lesson-a in the mock above
    const service = makeService([{ lessonId: null, missionId: 'mission-x' }]);
    const result = await service.getUserOverview('user-1');

    const lessons = result.modules[0]?.lessons ?? [];
    expect(lessons[0]?.status).toBe('completed'); // lesson-a resolved from mission-x
    expect(lessons[1]?.status).toBe('active'); // lesson-b advances
  });

  it('ignores legacy attempts whose missionId has no lesson mapping', async () => {
    const service = makeService([
      { lessonId: null, missionId: 'mission-unknown' },
      { lessonId: null, missionId: 'mission-unknown' },
    ]);
    const result = await service.getUserOverview('user-1');

    const lessons = result.modules[0]?.lessons ?? [];
    expect(lessons[0]?.status).toBe('active');
    expect(lessons[1]?.status).toBe('locked');
  });

  it('handles a mix of new-style and legacy completed attempts without double-counting', async () => {
    // lesson-a via direct lessonId plus a redundant legacy row for the same lesson
    const service = makeService([
      { lessonId: 'lesson-a', missionId: 'mission-x' },
      { lessonId: null, missionId: 'mission-x' },
    ]);
    const result = await service.getUserOverview('user-1');

    const lessons = result.modules[0]?.lessons ?? [];
    expect(lessons[0]?.status).toBe('completed');
    expect(lessons[1]?.status).toBe('active');
  });
});
