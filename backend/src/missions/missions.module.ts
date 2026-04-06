import { Module } from '@nestjs/common';
import { MissionsController } from './missions.controller';
import { MissionsService } from './missions.service';
import { InMemoryMissionsRepository, MISSIONS_REPOSITORY } from './missions.repository';

@Module({
  controllers: [MissionsController],
  providers: [
    MissionsService,
    {
      provide: MISSIONS_REPOSITORY,
      useClass: InMemoryMissionsRepository,
    },
  ],
  exports: [MissionsService],
})
export class MissionsModule {}
