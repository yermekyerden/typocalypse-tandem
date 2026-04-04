import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
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

  @Get('attempts/:attemptId/history')
  @ApiOkResponse({ description: 'Returns assistant chat history for the current attempt.' })
  @ApiNotFoundResponse({ description: 'Attempt not found.' })
  public async getHistoryForAttempt(
    @CurrentUser() user: { id: string },
    @Param('attemptId') attemptId: string,
  ) {
    const data = await this.assistantService.getHistoryForAttempt(user.id, attemptId);

    return { ok: true, data };
  }

  @Post('attempts/:attemptId')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'Returns an AI hint for the current attempt.' })
  @ApiNotFoundResponse({ description: 'Attempt or mission not found.' })
  @ApiConflictResponse({
    description: 'Assistant is not available for completed or abandoned attempts.',
  })
  public async askForAttempt(
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
