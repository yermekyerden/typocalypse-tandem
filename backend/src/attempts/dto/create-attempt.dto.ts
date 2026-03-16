import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAttemptDto {
  @ApiProperty({ description: 'The mission to attempt.' })
  @IsString()
  @MinLength(1)
  missionId!: string;
}
