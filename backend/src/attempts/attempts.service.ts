import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AttemptStep } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { MissionsService } from '../missions/missions.service';
import { EngineService } from '../engine/engine.service';
import { ExecutionTrace, ValidationResult, VfsSnapshot } from '../engine/engine.types';
import { CreateAttemptDto } from './dto/create-attempt.dto';
import { SubmitCommandDto } from './dto/submit-command.dto';
import { LearningContentService } from '../learning/learning-content.service';

type AttemptStatus = 'in_progress' | 'completed' | 'abandoned';

@Injectable()
export class AttemptsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly missions: MissionsService,
    private readonly engine: EngineService,
    private readonly learningContent: LearningContentService,
  ) {}

  async createAttempt(userId: string, dto: CreateAttemptDto) {
    if (!dto.lessonId && !dto.missionId) {
      throw new BadRequestException('Either lessonId or missionId must be provided.');
    }

    if (dto.lessonId) {
      return this.createLessonAttempt(userId, dto.lessonId);
    }

    const mission = this.missions.getMissionById(dto.missionId!);

    const attempt = await this.prisma.attempt.create({
      data: {
        userId,
        missionId: mission.id,
        missionVersion: mission.version,
        status: 'in_progress' satisfies AttemptStatus,
        currentCwd: mission.initialCwd,
        currentVfsJson: JSON.stringify(mission.initialFs),
        stepCount: 0,
      },
    });

    return {
      attemptId: attempt.id,
      initialCwd: mission.initialCwd,
      initialFs: mission.initialFs,
      mission: {
        id: mission.id,
        version: mission.version,
        chapterId: mission.chapterId,
        title: mission.title,
        difficulty: mission.difficulty,
        estimatedMinutes: mission.estimatedMinutes,
        shortDescription: mission.shortDescription,
        ...(mission.tags ? { tags: mission.tags } : {}),
      },
    };
  }

  private async createLessonAttempt(userId: string, lessonId: string) {
    const lesson = this.learningContent.getLessonDetailOrThrow(lessonId);
    const scenario = this.learningContent.getLessonAttemptScenarioOrThrow(lessonId);

    const attempt = await this.prisma.attempt.create({
      data: {
        userId,
        missionId: `lesson:${lessonId}`,
        missionVersion: 1,
        status: 'in_progress' satisfies AttemptStatus,
        currentCwd: scenario.initialCwd,
        currentVfsJson: JSON.stringify(scenario.initialFs),
        stepCount: 0,
      },
    });

    return {
      attemptId: attempt.id,
      initialCwd: scenario.initialCwd,
      initialFs: scenario.initialFs,
      lesson: {
        id: lesson.id,
        moduleId: lesson.moduleId,
        title: lesson.title,
        order: lesson.order,
      },
      ...(lesson.runtime ? { runtime: lesson.runtime } : {}),
    };
  }

  async getAttempt(userId: string, attemptId: string) {
    const attempt = await this.getOwnedAttemptWithStepsOrThrow(userId, attemptId);

    return {
      attempt: {
        attemptId: attempt.id,
        missionId: attempt.missionId,
        missionVersion: attempt.missionVersion,
        status: attempt.status as AttemptStatus,
        currentCwd: attempt.currentCwd,
        startedAtUtc: attempt.startedAtUtc.toISOString(),
        updatedAtUtc: attempt.updatedAtUtc.toISOString(),
        ...(attempt.finishedAtUtc ? { finishedAtUtc: attempt.finishedAtUtc.toISOString() } : {}),
        steps: attempt.steps.map((step: AttemptStep) => ({
          stepIndex: step.stepIndex,
          inputLine: step.inputLine,
          exitCode: step.exitCode,
          validation: JSON.parse(step.validationJson) as ValidationResult,
          trace: JSON.parse(step.traceJson) as ExecutionTrace,
          createdAtUtc: step.createdAtUtc.toISOString(),
        })),
      },
    };
  }

  async submitCommand(userId: string, attemptId: string, dto: SubmitCommandDto) {
    const attempt = await this.getOwnedAttemptOrThrow(userId, attemptId);

    this.assertAttemptInProgress(attempt.status as AttemptStatus, 'submit more commands');

    // Idempotency: if this clientCommandId was already recorded, return its result
    const existing = await this.prisma.attemptStep.findUnique({
      where: {
        attemptId_clientCommandId: {
          attemptId,
          clientCommandId: dto.clientCommandId,
        },
      },
    });

    if (existing) {
      return {
        stdout: existing.stdout,
        stderr: existing.stderr,
        exitCode: existing.exitCode,
        cwdAfter: existing.cwdAfter,
        attemptStatus: attempt.status as AttemptStatus,
        validation: JSON.parse(existing.validationJson) as ValidationResult,
        trace: JSON.parse(existing.traceJson) as ExecutionTrace,
        progressChanged: false,
      };
    }

    const currentVfs = JSON.parse(attempt.currentVfsJson) as VfsSnapshot;
    const runtime =
      attempt.missionId.startsWith('lesson:')
        ? this.resolveLessonRuntime(attempt.missionId.slice('lesson:'.length))
        : this.resolveMissionRuntime(attempt.missionId);

    // Run the engine
    const result = this.engine.run({
      inputLine: dto.command,
      vfs: currentVfs,
      cwd: attempt.currentCwd,
      checks: runtime.checks,
      constraints: {
        ...(runtime.allowedCommands ? { allowedCommands: runtime.allowedCommands } : {}),
      },
    });

    // Determine new attempt status
    const missionCompleted = result.validation.type === 'validation_ok';
    const newStatus: AttemptStatus = missionCompleted ? 'completed' : 'in_progress';
    const finishedAt = missionCompleted ? new Date() : null;

    const stepIndex = attempt.stepCount;

    // Persist step + update attempt in a transaction
    await this.prisma.$transaction([
      this.prisma.attemptStep.create({
        data: {
          attemptId,
          stepIndex,
          clientCommandId: dto.clientCommandId,
          inputLine: dto.command,
          stdout: result.stdout,
          stderr: result.stderr,
          exitCode: result.exitCode,
          cwdAfter: result.cwdAfter,
          validationJson: JSON.stringify(result.validation),
          traceJson: JSON.stringify(result.trace),
        },
      }),
      this.prisma.attempt.update({
        where: { id: attemptId },
        data: {
          currentCwd: result.cwdAfter,
          currentVfsJson: JSON.stringify(result.vfsAfter),
          status: newStatus,
          stepCount: { increment: 1 },
          ...(finishedAt ? { finishedAtUtc: finishedAt } : {}),
        },
      }),
    ]);

    return {
      stdout: result.stdout,
      stderr: result.stderr,
      exitCode: result.exitCode,
      cwdAfter: result.cwdAfter,
      attemptStatus: newStatus,
      validation: result.validation,
      trace: result.trace,
      progressChanged: missionCompleted,
    };
  }

  async abandonAttempt(userId: string, attemptId: string) {
    const attempt = await this.getOwnedAttemptOrThrow(userId, attemptId);

    this.assertAttemptInProgress(attempt.status as AttemptStatus, 'abandon');

    await this.prisma.attempt.update({
      where: { id: attemptId },
      data: {
        status: 'abandoned' satisfies AttemptStatus,
        finishedAtUtc: new Date(),
      },
    });

    return { attemptId, status: 'abandoned' as const };
  }

  private async getOwnedAttemptOrThrow(userId: string, attemptId: string) {
    const attempt = await this.prisma.attempt.findUnique({
      where: { id: attemptId },
    });

    if (!attempt) {
      throw new NotFoundException(`Attempt not found: ${attemptId}`);
    }

    if (attempt.userId !== userId) {
      throw new ForbiddenException('You do not own this attempt.');
    }

    return attempt;
  }

  private async getOwnedAttemptWithStepsOrThrow(userId: string, attemptId: string) {
    const attempt = await this.prisma.attempt.findUnique({
      where: { id: attemptId },
      include: { steps: { orderBy: { stepIndex: 'asc' } } },
    });

    if (!attempt) {
      throw new NotFoundException(`Attempt not found: ${attemptId}`);
    }

    if (attempt.userId !== userId) {
      throw new ForbiddenException('You do not own this attempt.');
    }

    return attempt;
  }

  private assertAttemptInProgress(
    status: AttemptStatus,
    action: 'submit more commands' | 'abandon',
  ) {
    if (status !== 'in_progress') {
      throw new ConflictException(`Attempt is already ${status}. Cannot ${action}.`);
    }
  }

  private resolveLessonRuntime(lessonId: string) {
    return this.learningContent.getLessonAttemptScenarioOrThrow(lessonId);
  }

  private resolveMissionRuntime(missionId: string) {
    const mission = this.missions.getMissionById(missionId);
    return {
      checks: mission.checks,
      allowedCommands: mission.allowedCommands,
    };
  }
}
