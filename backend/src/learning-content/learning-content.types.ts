import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import type { MissionCheck, VfsSnapshot } from '../engine/engine.types';

export type LessonHeuristicStatus = 'locked' | 'active' | 'completed';

export type LessonOverview = {
  id: string;
  slug: string;
  title: string;
  order: number;
  status: LessonHeuristicStatus;
};

export type ModuleOverview = {
  id: string;
  slug: string;
  title: string;
  description: string;
  order: number;
  lessons: LessonOverview[];
};

export type LessonDetail = {
  id: string;
  moduleId: string;
  slug: string;
  title: string;
  order: number;
  theoryMarkdown: string;
  taskDescription: string;
  hints?: string[];
  runtime?: LessonRuntime;
};

export type LearningOverviewResponse = {
  modules: ModuleOverview[];
};

export type LearningLessonDetailResponse = {
  lesson: LessonDetail;
};

export type LessonRuntime = {
  expectedCommand: string;
  expectedCwd?: string;
  sampleOutput?: string;
};

export type LessonAttemptScenario = {
  initialCwd: string;
  initialFs: VfsSnapshot;
  allowedCommands?: string[];
  checks: MissionCheck[];
};

export class LessonRuntimeDefinition {
  @IsString()
  @MinLength(1)
  expectedCommand!: string;

  @IsOptional()
  @IsString()
  expectedCwd?: string;

  @IsOptional()
  @IsString()
  sampleOutput?: string;
}

export class LessonContentDefinition {
  @IsString()
  @MinLength(1)
  id!: string;

  @IsString()
  @MinLength(1)
  slug!: string;

  @IsString()
  @MinLength(1)
  moduleId!: string;

  @IsString()
  @MinLength(1)
  title!: string;

  @IsInt()
  @Min(1)
  order!: number;

  @IsString()
  @MinLength(1)
  theoryMarkdown!: string;

  @IsString()
  @MinLength(1)
  taskDescription!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  hints?: string[];

  @IsOptional()
  runtime?: LessonRuntimeDefinition;
}

export class ModuleContentDefinition {
  @IsString()
  @MinLength(1)
  id!: string;

  @IsString()
  @MinLength(1)
  slug!: string;

  @IsString()
  @MinLength(1)
  title!: string;

  @IsString()
  @MinLength(1)
  description!: string;

  @IsInt()
  @Min(1)
  order!: number;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  lessonIds!: string[];
}

export type LearningContentSource = {
  modules: ModuleContentDefinition[];
  lessons: LessonContentDefinition[];
};
