import { ApiProperty } from '@nestjs/swagger';

export class CreateAttemptResponseDto {
  @ApiProperty({ format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440000' })
  attemptId!: string;

  @ApiProperty({ example: '/home' })
  initialCwd!: string;

  @ApiProperty({
    description: 'Initial virtual filesystem snapshot. Shape: { root: VfsDirNode }',
    type: 'object',
    additionalProperties: true,
  })
  initialFs!: Record<string, unknown>;
}
