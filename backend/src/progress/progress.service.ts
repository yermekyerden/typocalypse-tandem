import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type MissionProgressStatus = 'not_started' | 'in_progress' | 'completed';

type MissionProgressEntry = {
  missionId: string;
  missionVersion: number;
  status: MissionProgressStatus;
  attemptsCount: number;
  lastAttemptAtUtc?: string;
  bestAttemptId?: string;
  completedAtUtc?: string;
};

@Injectable()
export class ProgressService {
  constructor(private readonly prisma: PrismaService) {}

  async getProgress(userId: string) {
    const attempts = await this.prisma.attempt.findMany({
      where: { userId },
      orderBy: { startedAtUtc: 'asc' },
      select: {
        id: true,
        missionId: true,
        missionVersion: true,
        status: true,
        startedAtUtc: true,
        finishedAtUtc: true,
      },
    });

    const byMission = new Map<string, typeof attempts>();

    for (const attempt of attempts) {
      const list = byMission.get(attempt.missionId) ?? [];
      list.push(attempt);
      byMission.set(attempt.missionId, list);
    }

    const missions: MissionProgressEntry[] = [];
    let latestUpdateUtc = new Date(0);

    for (const [missionId, missionAttempts] of byMission.entries()) {
      const completed = missionAttempts.filter((a) => a.status === 'completed');
      const inProgress = missionAttempts.filter((a) => a.status === 'in_progress');

      const last = missionAttempts[missionAttempts.length - 1];
      if (last && last.startedAtUtc > latestUpdateUtc) {
        latestUpdateUtc = last.startedAtUtc;
      }

      let status: MissionProgressEntry['status'] = 'not_started';
      if (completed.length > 0) status = 'completed';
      else if (inProgress.length > 0) status = 'in_progress';

      const entry: MissionProgressEntry = {
        missionId,
        missionVersion: missionAttempts[0].missionVersion,
        status,
        attemptsCount: missionAttempts.length,
      };

      if (last?.startedAtUtc) {
        entry.lastAttemptAtUtc = last.startedAtUtc.toISOString();
      }

      if (completed.length > 0 && completed[0]) {
        entry.bestAttemptId = completed[0].id;
        if (completed[0].finishedAtUtc) {
          entry.completedAtUtc = completed[0].finishedAtUtc.toISOString();
        }
      }

      missions.push(entry);
    }

    return {
      progress: {
        updatedAtUtc:
          latestUpdateUtc.getTime() === 0
            ? new Date().toISOString()
            : latestUpdateUtc.toISOString(),
        missions,
      },
    };
  }
}
