import { ApiProperty } from '@nestjs/swagger';
import { AuthTokensResponseDto } from './auth-tokens-response.dto';
import { UserResponseDto } from './user-response.dto';

export class AuthResponseDto {
  @ApiProperty({ type: UserResponseDto })
  user: UserResponseDto;

  @ApiProperty({ type: AuthTokensResponseDto })
  tokens: AuthTokensResponseDto;
}
