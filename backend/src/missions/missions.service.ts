import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import * as MissionsRepo from './missions.repository';
import { LoadedMission, LoadedMissionHeader } from '../missions-content/missions-content.loader';

@Injectable()
export class MissionsService {
  constructor(
    @Inject(MissionsRepo.MISSIONS_REPOSITORY)
    private readonly repository: MissionsRepo.IMissionsRepository,
  ) {}

  listMissions(): LoadedMissionHeader[] {
    return this.repository.findAll();
  }

  getMissionById(id: string): LoadedMission {
    const mission = this.repository.findById(id);
    if (mission === null) {
      throw new NotFoundException(`Mission not found: ${id}`);
    }
    return mission;
  }
}
