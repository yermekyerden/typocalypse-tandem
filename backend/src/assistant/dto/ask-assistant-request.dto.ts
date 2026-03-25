import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class AskAssistantRequestDto {
  @ApiProperty({
    description: 'User question for the assistant.',
    example: 'Give me a hint without solving the mission.',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  question!: string;
}
