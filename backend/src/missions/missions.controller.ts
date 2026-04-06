import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiNotFoundResponse, ApiTags } from '@nestjs/swagger';
import { MissionsService } from './missions.service';

@ApiTags('missions')
@Controller('missions')
export class MissionsController {
  constructor(private readonly missionsService: MissionsService) {}

  @Get()
  @ApiOkResponse({ description: 'Returns all mission headers.' })
  listMissions() {
    const missions = this.missionsService.listMissions();
    return { ok: true, data: { missions } };
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Returns a full mission by id.' })
  @ApiNotFoundResponse({ description: 'Mission not found.' })
  getMissionById(@Param('id') id: string) {
    const mission = this.missionsService.getMissionById(id);
    return { ok: true, data: { mission } };
  }
}
