import { Injectable } from '@nestjs/common';
import {
  loadMissionsContent,
  LoadedMission,
  LoadedMissionHeader,
} from '../missions-content/missions-content.loader';
import { missionContentSource } from '../missions-content/missions-content.registry';

/** Stable token for registering and injecting the missions repository. */
export const MISSIONS_REPOSITORY = 'MISSIONS_REPOSITORY';

export interface IMissionsRepository {
  findAll(): LoadedMissionHeader[];
  findById(id: string): LoadedMission | null;
}

@Injectable()
export class InMemoryMissionsRepository implements IMissionsRepository {
  private readonly content = loadMissionsContent(missionContentSource);

  findAll(): LoadedMissionHeader[] {
    return this.content.missions.map((m) => ({
      id: m.id,
      version: m.version,
      chapterId: m.chapterId,
      title: m.title,
      difficulty: m.difficulty,
      estimatedMinutes: m.estimatedMinutes,
      shortDescription: m.shortDescription,
      ...(m.tags ? { tags: m.tags } : {}),
    }));
  }

  findById(id: string): LoadedMission | null {
    return this.content.missionById.get(id) ?? null;
  }
}
