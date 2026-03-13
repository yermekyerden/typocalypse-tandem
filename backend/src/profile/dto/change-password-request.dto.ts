import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ChangePasswordRequestDto {
  @ApiProperty({ example: 'oldPassword123' })
  @IsString()
  currentPassword: string;

  @ApiProperty({ example: 'newPassword456' })
  @IsString()
  @MinLength(8)
  newPassword: string;
}
