import { ApiProperty } from '@nestjs/swagger';

export class PublicProfileResponseDto {
  @ApiProperty({ example: '7e393f8e-d5f1-4d47-84d4-a1a8759eb0df' })
  id: string;

  @ApiProperty({ example: 'neo' })
  username: string;

  @ApiProperty({ example: 'Thomas' })
  firstName: string;

  @ApiProperty({ example: 'Anderson' })
  lastName: string;

  @ApiProperty({ nullable: true, example: null })
  avatarUrl: string | null;
}
