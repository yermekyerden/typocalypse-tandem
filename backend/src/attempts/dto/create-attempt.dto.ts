import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAttemptDto {
  @ApiProperty({ description: 'The lesson to start. Must exist in the learning content.' })
  @IsString()
  @MinLength(1)
  lessonId!: string;
}
