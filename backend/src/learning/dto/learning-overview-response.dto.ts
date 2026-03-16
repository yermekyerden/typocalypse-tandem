import { ApiProperty } from '@nestjs/swagger';
import { ModuleOverviewDto } from './module-overview.dto';

export class LearningOverviewResponseDto {
  @ApiProperty({ type: ModuleOverviewDto, isArray: true })
  modules: ModuleOverviewDto[];
}
