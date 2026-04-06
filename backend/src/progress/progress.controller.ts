import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ProgressService } from './progress.service';

@ApiTags('progress')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get()
  @ApiOkResponse({ description: 'Returns derived progress for the current user.' })
  async getProgress(@CurrentUser() user: { id: string }) {
    const data = await this.progressService.getProgress(user.id);
    return { ok: true, data };
  }
}
