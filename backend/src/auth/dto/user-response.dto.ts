import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ example: '7e393f8e-d5f1-4d47-84d4-a1a8759eb0df' })
  id: string;

  @ApiProperty({ example: 'neo' })
  username: string;

  @ApiProperty({ example: '' })
  firstName: string;

  @ApiProperty({ example: '' })
  lastName: string;

  @ApiProperty({ example: 'neo@zion.dev' })
  email: string;

  @ApiProperty({ nullable: true, example: null })
  avatarUrl: string | null;

  @ApiProperty({ example: '2026-03-04T10:35:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-03-04T10:35:00.000Z' })
  updatedAt: string;
}
