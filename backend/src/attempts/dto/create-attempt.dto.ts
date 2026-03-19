import { IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAttemptDto {
  @ApiProperty({ description: 'The mission to attempt.', required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  missionId?: string;

  @ApiProperty({ description: 'The lesson to attempt.', required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  lessonId?: string;
}
