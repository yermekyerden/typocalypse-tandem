import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { UsersModule } from '../users/users.module';
import { LearningController } from './learning.controller';
import { LearningContentService } from './learning-content.service';

@Module({
  imports: [JwtModule.register({}), UsersModule],
  controllers: [LearningController],
  providers: [LearningContentService, JwtAuthGuard],
  exports: [LearningContentService],
})
export class LearningModule {}
