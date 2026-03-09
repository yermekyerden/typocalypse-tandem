import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { UserResponseDto } from '../auth/dto/user-response.dto';
import * as UsersTypes from '../users/users.types';
import { ChangePasswordRequestDto } from './dto/change-password-request.dto';
import { PublicProfileResponseDto } from './dto/public-profile-response.dto';
import { UpdateProfileRequestDto } from './dto/update-profile-request.dto';
import { avatarMulterOptions } from './multer-avatar.config';
import { ProfileService } from './profile.service';

@ApiTags('Profile')
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get own profile (full)' })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  getMe(@CurrentUser() user: UsersTypes.User): UsersTypes.User {
    return this.profileService.getProfile(user.id);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update own profile (firstName, lastName)' })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiBadRequestResponse({ description: 'Validation error' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  updateMe(
    @CurrentUser() user: UsersTypes.User,
    @Body() dto: UpdateProfileRequestDto,
  ): UsersTypes.User {
    return this.profileService.updateProfile(user.id, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get public profile by id' })
  @ApiOkResponse({ type: PublicProfileResponseDto })
  @ApiNotFoundResponse({ description: 'User not found' })
  getPublicProfile(@Param('id', ParseUUIDPipe) id: string) {
    return this.profileService.getPublicProfile(id);
  }

  @Patch('me/password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Change password' })
  @ApiNoContentResponse({ description: 'Password changed' })
  @ApiBadRequestResponse({ description: 'Validation error' })
  @ApiUnauthorizedResponse({ description: 'Wrong current password or unauthorized' })
  async changePassword(
    @CurrentUser() user: UsersTypes.User,
    @Body() dto: ChangePasswordRequestDto,
  ): Promise<void> {
    await this.profileService.changePassword(user.id, dto.currentPassword, dto.newPassword);
  }

  @Post('me/avatar')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @UseInterceptors(FileInterceptor('avatar', avatarMulterOptions))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload avatar' })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid file type or size' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  uploadAvatar(
    @CurrentUser() user: UsersTypes.User,
    @UploadedFile() file: Express.Multer.File,
  ): UsersTypes.User {
    return this.profileService.updateAvatar(user.id, file.filename);
  }

  @Delete('me/avatar')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Remove avatar' })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  removeAvatar(@CurrentUser() user: UsersTypes.User): UsersTypes.User {
    return this.profileService.removeAvatar(user.id);
  }
}
