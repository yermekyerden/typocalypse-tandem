import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { buildOkResponse } from '../common/response.helper';
import { ApiOkEnvelopeOf } from '../common/api-ok-envelope.dto';
import { AttemptsService } from './attempts.service';
import { CreateAttemptDto } from './dto/create-attempt.dto';
import { CreateAttemptResponseDto } from './dto/create-attempt-response.dto';
import { SubmitCommandDto } from './dto/submit-command.dto';

@ApiTags('attempts')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('attempts')
export class AttemptsController {
  constructor(private readonly attemptsService: AttemptsService) {}

  @Post()
  @ApiCreatedResponse({ type: ApiOkEnvelopeOf(CreateAttemptResponseDto) })
  @ApiNotFoundResponse({ description: 'Lesson not found.' })
  @ApiUnprocessableEntityResponse({ description: 'Lesson exists but has no mission mapping.' })
  async createAttempt(@CurrentUser() user: { id: string }, @Body() dto: CreateAttemptDto) {
    const data = await this.attemptsService.createAttempt(user.id, dto);
    return buildOkResponse(data);
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Returns attempt with full step history.' })
  @ApiNotFoundResponse({ description: 'Attempt not found.' })
  @ApiForbiddenResponse({ description: 'Attempt belongs to another user.' })
  async getAttempt(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    const data = await this.attemptsService.getAttempt(user.id, id);
    return buildOkResponse(data);
  }

  @Patch(':id/command')
  @ApiOkResponse({ description: 'Executes a command and returns result.' })
  @ApiNotFoundResponse({ description: 'Attempt not found.' })
  @ApiConflictResponse({ description: 'Attempt is completed or abandoned.' })
  async submitCommand(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: SubmitCommandDto,
  ) {
    const data = await this.attemptsService.submitCommand(user.id, id, dto);
    return buildOkResponse(data);
  }

  @Patch(':id/abandon')
  @ApiOkResponse({ description: 'Marks the attempt as abandoned.' })
  @ApiNotFoundResponse({ description: 'Attempt not found.' })
  @ApiConflictResponse({ description: 'Attempt is already finished.' })
  async abandonAttempt(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    const data = await this.attemptsService.abandonAttempt(user.id, id);
    return buildOkResponse(data);
  }
}
