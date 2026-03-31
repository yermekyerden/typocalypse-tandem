import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { buildOkResponse } from '../common/response.helper';
import { LearningLessonDetailResponseDto } from './dto/learning-lesson-detail-response.dto';
import { LearningOverviewResponseDto } from './dto/learning-overview-response.dto';
import { LearningContentService } from './learning-content.service';
import { LearningOverviewService } from './learning-overview.service';

@ApiTags('Learning')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller()
export class LearningController {
  constructor(
    private readonly learningContentService: LearningContentService,
    private readonly learningOverviewService: LearningOverviewService,
  ) {}

  @Get('learning/overview')
  @ApiOperation({ summary: 'Get module and lesson overview with per-user lesson statuses' })
  @ApiOkResponse({ type: LearningOverviewResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing, invalid, or expired access token' })
  async getOverview(@CurrentUser() user: { id: string }) {
    const data = await this.learningOverviewService.getUserOverview(user.id);
    return buildOkResponse(data);
  }

  @Get('lessons/:id')
  @ApiOperation({ summary: 'Get lesson detail content by lesson identifier' })
  @ApiOkResponse({ type: LearningLessonDetailResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing, invalid, or expired access token' })
  @ApiNotFoundResponse({ description: 'Lesson was not found' })
  getLessonById(@Param('id') lessonId: string) {
    return buildOkResponse(this.learningContentService.getLessonById(lessonId));
  }
}
