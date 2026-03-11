import { ApiProperty } from '@nestjs/swagger';
import { IsJWT } from 'class-validator';

export class RefreshRequestDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refresh.payload.signature',
  })
  @IsJWT()
  refreshToken: string;
}
