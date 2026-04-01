import { ConflictException, ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AttemptsController } from './attempts.controller';
import { AttemptsService } from './attempts.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

void JwtAuthGuard;

const MOCK_USER = { id: 'user-1' };
const MOCK_ATTEMPT_ID = 'attempt-uuid';

describe('AttemptsController', () => {
  let controller: AttemptsController;
  let attemptsService: jest.Mocked<AttemptsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AttemptsController],
      providers: [
        {
          provide: AttemptsService,
          useValue: {
            createAttempt: jest.fn(),
            getAttempt: jest.fn(),
            submitCommand: jest.fn(),
            abandonAttempt: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(AttemptsController);
    attemptsService = module.get(AttemptsService);
  });

  describe('createAttempt', () => {
    it('returns ApiOk envelope with attemptId, initialCwd, initialFs', async () => {
      const mockData = {
        attemptId: MOCK_ATTEMPT_ID,
        initialCwd: '/home/dojo',
        initialFs: { root: { type: 'dir' as const, name: '', children: [] } },
      };
      attemptsService.createAttempt.mockResolvedValue(mockData);

      const result = await controller.createAttempt(MOCK_USER, { lessonId: 'ls-home' });

      expect(result.ok).toBe(true);
      expect(result.data).toBe(mockData);
      expect('mission' in result.data).toBe(false);
    });
  });

  describe('submitCommand', () => {
    it('returns ApiOk envelope with command result', async () => {
      const mockData = {
        stdout: '',
        stderr: '',
        exitCode: 0,
        cwdAfter: '/home/dojo',
        attemptStatus: 'in_progress' as const,
        validation: {
          type: 'validation_failed' as const,
          failedAtUtc: '',
          failedCheckId: '',
          reports: [],
        },
        trace: {
          traceId: '',
          inputLine: '',
          parse: { ok: true },
          resolve: { cwdBefore: '', resolvedPaths: [] },
          execute: { exitCode: 0 },
          validate: {
            result: {
              type: 'validation_failed' as const,
              failedAtUtc: '',
              failedCheckId: '',
              reports: [],
            },
          },
          budgets: {},
        },
        progressChanged: false,
      };
      attemptsService.submitCommand.mockResolvedValue(mockData as never);

      const result = await controller.submitCommand(MOCK_USER, MOCK_ATTEMPT_ID, {
        command: 'ls',
        clientCommandId: 'uuid',
      });

      expect(result.ok).toBe(true);
      expect(result.contractsVersion).toBeDefined();
    });

    it('propagates ForbiddenException for wrong owner', async () => {
      attemptsService.submitCommand.mockRejectedValue(new ForbiddenException());
      await expect(
        controller.submitCommand(MOCK_USER, MOCK_ATTEMPT_ID, {
          command: 'ls',
          clientCommandId: 'uuid',
        }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('abandonAttempt', () => {
    it('propagates ForbiddenException for wrong owner', async () => {
      attemptsService.abandonAttempt.mockRejectedValue(new ForbiddenException());
      await expect(controller.abandonAttempt(MOCK_USER, MOCK_ATTEMPT_ID)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('propagates ConflictException for non-in_progress attempt', async () => {
      attemptsService.abandonAttempt.mockRejectedValue(new ConflictException());
      await expect(controller.abandonAttempt(MOCK_USER, MOCK_ATTEMPT_ID)).rejects.toThrow(
        ConflictException,
      );
    });
  });
});
