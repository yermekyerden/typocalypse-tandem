import { ApiProperty } from '@nestjs/swagger';
import type { LessonHeuristicStatus } from '../../learning-content/learning-content.types';

export class LessonOverviewDto {
  @ApiProperty({ example: 'ls-home' })
  id: string;

  @ApiProperty({ example: 'ls-home' })
  slug: string;

  @ApiProperty({ example: 'List home directory' })
  title: string;

  @ApiProperty({ example: 1 })
  order: number;

  @ApiProperty({ enum: ['locked', 'active', 'completed'], example: 'active' })
  status: LessonHeuristicStatus;
}
