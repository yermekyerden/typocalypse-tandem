import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class AskAssistantRequestDto {
  @ApiProperty({
    description: 'User question for the assistant.',
    example: 'Give me a hint without solving the mission.',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  question!: string;

  @ApiPropertyOptional({
    description: 'Preferred UI locale for the assistant response.',
    enum: ['en', 'kk', 'ru'],
    example: 'en',
  })
  @IsOptional()
  @IsString()
  @IsIn(['en', 'kk', 'ru'])
  locale?: string;
}
