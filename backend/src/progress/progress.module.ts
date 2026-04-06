import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ProgressController } from './progress.controller';
import { ProgressService } from './progress.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Module({
  imports: [JwtModule.register({})],
  controllers: [ProgressController],
  providers: [ProgressService, JwtAuthGuard],
})
export class ProgressModule {}
