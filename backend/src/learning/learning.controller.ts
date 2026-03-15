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
import { LearningLessonDetailResponseDto } from './dto/learning-lesson-detail-response.dto';
import { LearningOverviewResponseDto } from './dto/learning-overview-response.dto';
import { LearningContentService } from './learning-content.service';

@ApiTags('Learning')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller()
export class LearningController {
  constructor(private readonly learningContentService: LearningContentService) {}

  @Get('learning/overview')
  @ApiOperation({ summary: 'Get module and lesson overview for the curriculum' })
  @ApiOkResponse({ type: LearningOverviewResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing, invalid, or expired access token' })
  getOverview() {
    return this.learningContentService.getOverview();
  }

  @Get('lessons/:id')
  @ApiOperation({ summary: 'Get lesson detail content by lesson identifier' })
  @ApiOkResponse({ type: LearningLessonDetailResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing, invalid, or expired access token' })
  @ApiNotFoundResponse({ description: 'Lesson was not found' })
  getLessonById(@Param('id') lessonId: string) {
    return this.learningContentService.getLessonById(lessonId);
  }
}
