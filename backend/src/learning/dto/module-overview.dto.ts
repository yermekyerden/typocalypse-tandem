import { ApiProperty } from '@nestjs/swagger';
import { LessonOverviewDto } from './lesson-overview.dto';

export class ModuleOverviewDto {
  @ApiProperty({ example: 'cmd-basics' })
  id: string;

  @ApiProperty({ example: 'cmd-basics' })
  slug: string;

  @ApiProperty({ example: 'Command Line Basics' })
  title: string;

  @ApiProperty({
    example: 'Navigate directories, list contents, and read files with core shell commands.',
  })
  description: string;

  @ApiProperty({ example: 1 })
  order: number;

  @ApiProperty({ type: LessonOverviewDto, isArray: true })
  lessons: LessonOverviewDto[];
}
