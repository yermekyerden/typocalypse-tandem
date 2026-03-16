import { ApiProperty } from '@nestjs/swagger';

export class AuthTokensResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.access.payload.signature',
  })
  accessToken: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refresh.payload.signature',
  })
  refreshToken: string;

  @ApiProperty({ example: '2026-03-04T10:50:00.000Z' })
  expiresAt: string;
}
