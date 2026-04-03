import { NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { AttemptsService } from './attempts.service';

// Minimal stubs — controller unit specs mock the full service; this spec
// targets service-level business logic only.

const KNOWN_LESSON_ID = 'ls-home';
const MAPPED_MISSION_ID = 'ch01-m01-list-home';
// A lesson ID that is known to learning content but intentionally has no mission mapping.
// This is a stub value — the mock getLessonById returns it as known, and the real
// LESSON_MISSION_MAP will not contain it (it is not a real lesson).
const UNMAPPED_LESSON_ID = 'display-only-lesson';

const MOCK_MISSION = {
  id: MAPPED_MISSION_ID,
  version: 1,
  chapterId: 'ch-01-basics',
  title: 'List the home directory',
  difficulty: 'easy' as const,
  estimatedMinutes: 2,
  shortDescription: 'Use ls.',
  descriptionMd: 'Use ls.',
  initialCwd: '/home/dojo',
  initialFs: {
    root: { type: 'dir' as const, name: '', children: [] },
  },
  checks: [],
  hints: [],
  allowedCommands: ['ls'],
};

const MOCK_ATTEMPT_ID = 'attempt-uuid-1234';

function makeMockPrisma(overrides: Record<string, unknown> = {}) {
  return {
    attempt: {
      create: jest.fn().mockResolvedValue({ id: MOCK_ATTEMPT_ID, ...overrides }),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    attemptStep: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  };
}

function makeMockMissions() {
  return {
    getMissionById: jest.fn((id: string) => {
      if (id === MAPPED_MISSION_ID) return MOCK_MISSION;
      throw new NotFoundException(`Mission not found: ${id}`);
    }),
  };
}

function makeMockEngine() {
  return { run: jest.fn() };
}

function makeMockLearningContent() {
  return {
    getLessonById: jest.fn((id: string) => {
      if (id === KNOWN_LESSON_ID || id === UNMAPPED_LESSON_ID) return { id };
      throw new NotFoundException(`Lesson "${id}" was not found`);
    }),
  };
}

function makeService(prismaOverrides: Record<string, unknown> = {}) {
  return new AttemptsService(
    makeMockPrisma(prismaOverrides) as never,
    makeMockMissions() as never,
    makeMockEngine() as never,
    makeMockLearningContent() as never,
  );
}

describe('AttemptsService.createAttempt', () => {
  it('resolves correct missionId for a known mapped lessonId', async () => {
    const service = makeService();
    const result = await service.createAttempt('user-1', { lessonId: KNOWN_LESSON_ID });

    expect(result.attemptId).toBe(MOCK_ATTEMPT_ID);
    expect(result.initialCwd).toBe('/home/dojo');
    expect(result.initialFs).toBeDefined();
    // mission field removed from public response
    expect(result).not.toHaveProperty('mission');
  });

  it('throws 404 for a lessonId not in learning content', async () => {
    const service = makeService();
    await expect(service.createAttempt('user-1', { lessonId: 'no-such-lesson' })).rejects.toThrow(
      NotFoundException,
    );
  });

  it('throws 422 for a lessonId that exists but has no mission mapping', async () => {
    const service = makeService();
    await expect(service.createAttempt('user-1', { lessonId: UNMAPPED_LESSON_ID })).rejects.toThrow(
      UnprocessableEntityException,
    );
  });

  it('persists both lessonId and missionId on the created row', async () => {
    const mockPrisma = makeMockPrisma();
    mockPrisma.attempt.create.mockResolvedValue({ id: MOCK_ATTEMPT_ID });
    const service = new AttemptsService(
      mockPrisma as never,
      makeMockMissions() as never,
      makeMockEngine() as never,
      makeMockLearningContent() as never,
    );

    await service.createAttempt('user-1', { lessonId: KNOWN_LESSON_ID });

    const [callArg] = mockPrisma.attempt.create.mock.calls[0] as [{ data: Record<string, string> }];
    expect(callArg.data.lessonId).toBe(KNOWN_LESSON_ID);
    expect(callArg.data.missionId).toBe(MAPPED_MISSION_ID);
  });
});
