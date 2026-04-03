import { Body, Controller, HttpCode, HttpStatus, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AssistantService } from './assistant.service';
import { AskAssistantRequestDto } from './dto/ask-assistant-request.dto';

@ApiTags('assistant')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('assistant')
export class AssistantController {
  constructor(private readonly assistantService: AssistantService) {}

  @Post('attempts/:attemptId')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'Returns an AI hint for the current attempt.' })
  @ApiNotFoundResponse({ description: 'Attempt or mission not found.' })
  @ApiConflictResponse({
    description: 'Assistant is not available for completed or abandoned attempts.',
  })
  async askForAttempt(
    @CurrentUser() user: { id: string },
    @Param('attemptId') attemptId: string,
    @Body() dto: AskAssistantRequestDto,
  ) {
    const data = await this.assistantService.askForAttempt(
      user.id,
      attemptId,
      dto.question,
      dto.locale,
    );

    return { ok: true, data };
  }
}
