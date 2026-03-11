import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterRequestDto {
  @ApiProperty({ example: 'neo' })
  @IsString()
  @MinLength(3)
  username: string;

  @ApiProperty({ example: 'neo@zion.dev' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'supersecure' })
  @IsString()
  @MinLength(8)
  password: string;
}
