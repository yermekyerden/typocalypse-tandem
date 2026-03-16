import { ApiProperty } from '@nestjs/swagger';
import { LessonDetailDto } from './lesson-detail.dto';

export class LearningLessonDetailResponseDto {
  @ApiProperty({ type: LessonDetailDto })
  lesson: LessonDetailDto;
}
