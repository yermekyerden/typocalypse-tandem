import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthResponse, AuthTokens } from './auth.types';
import { LoginRequestDto } from './dto/login-request.dto';
import { RefreshRequestDto } from './dto/refresh-request.dto';
import { RegisterRequestDto } from './dto/register-request.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterRequestDto): Promise<AuthResponse> {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginRequestDto): Promise<AuthResponse> {
    return this.authService.login(dto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(@Body() dto: RefreshRequestDto): Promise<AuthTokens> {
    return this.authService.refresh(dto);
  }
}
