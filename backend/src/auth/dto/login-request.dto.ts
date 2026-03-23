import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class LoginRequestDto {
  @ApiProperty({ example: 'neo' })
  @IsString()
  @MinLength(3)
  username: string;

  @ApiProperty({ example: 'supersecure' })
  @IsString()
  @MinLength(8)
  password: string;
}
