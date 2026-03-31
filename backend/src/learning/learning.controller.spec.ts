import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { LearningController } from './learning.controller';
import { LearningContentService } from './learning-content.service';
import { LearningOverviewService } from './learning-overview.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

// Suppress unused variable warning for the guard import — it is used via overrideGuard
void JwtAuthGuard;

const MOCK_OVERVIEW = {
  modules: [
    {
      id: 'mod-1',
      slug: 'mod-1',
      title: 'Module 1',
      description: 'Desc',
      order: 1,
      lessons: [{ id: 'ls-home', slug: 'ls-home', title: 'List home', order: 1, status: 'active' }],
    },
  ],
};

const MOCK_LESSON_DETAIL = {
  id: 'ls-home',
  moduleId: 'mod-1',
  slug: 'ls-home',
  title: 'List home',
  order: 1,
  theoryMarkdown: 'Use ls.',
  taskDescription: 'Run ls.',
};

describe('LearningController', () => {
  let controller: LearningController;
  let learningContentService: jest.Mocked<LearningContentService>;
  let learningOverviewService: jest.Mocked<LearningOverviewService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LearningController],
      providers: [
        {
          provide: LearningContentService,
          useValue: {
            getLessonById: jest.fn(),
          },
        },
        {
          provide: LearningOverviewService,
          useValue: {
            getUserOverview: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(LearningController);
    learningContentService = module.get(LearningContentService);
    learningOverviewService = module.get(LearningOverviewService);
  });

  describe('getOverview', () => {
    it('returns ApiOk envelope wrapping overview data', async () => {
      learningOverviewService.getUserOverview.mockResolvedValue(MOCK_OVERVIEW);
      const result = await controller.getOverview({ id: 'user-1' });

      expect(result.ok).toBe(true);
      expect(result.contractsVersion).toBeDefined();
      expect(result.serverTimeUtc).toBeDefined();
      expect(result.data).toBe(MOCK_OVERVIEW);
    });

    it('passes userId to getUserOverview', async () => {
      learningOverviewService.getUserOverview.mockResolvedValue(MOCK_OVERVIEW);
      await controller.getOverview({ id: 'user-abc' });
      expect(learningOverviewService.getUserOverview.mock.calls[0]).toEqual(['user-abc']);
    });
  });

  describe('getLessonById', () => {
    it('returns ApiOk envelope with lesson detail — no missionId in response', () => {
      learningContentService.getLessonById.mockReturnValue({ lesson: MOCK_LESSON_DETAIL });
      const result = controller.getLessonById('ls-home');

      expect(result.ok).toBe(true);
      expect(result.data.lesson.id).toBe('ls-home');
      // missionId must not leak into the lesson detail payload
      expect('missionId' in result.data.lesson).toBe(false);
    });

    it('propagates NotFoundException for unknown lesson', () => {
      learningContentService.getLessonById.mockImplementation(() => {
        throw new NotFoundException('Lesson not found');
      });

      expect(() => controller.getLessonById('unknown')).toThrow(NotFoundException);
    });
  });
});
