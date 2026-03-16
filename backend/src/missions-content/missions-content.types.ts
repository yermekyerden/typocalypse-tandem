import {
  ArrayMinSize,
  IsArray,
  IsDefined,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export type MissionDifficulty = 'easy' | 'medium' | 'hard';

/** Flat portion of a mission JSON file validated by class-validator. */
export class MissionDefinition {
  @IsString()
  @MinLength(1)
  id!: string;

  @IsInt()
  @Min(1)
  version!: number;

  @IsString()
  @MinLength(1)
  chapterId!: string;

  @IsString()
  @MinLength(1)
  title!: string;

  @IsIn(['easy', 'medium', 'hard'])
  difficulty!: MissionDifficulty;

  @IsInt()
  @Min(1)
  estimatedMinutes!: number;

  @IsString()
  @MinLength(1)
  shortDescription!: string;

  @IsString()
  @MinLength(1)
  descriptionMd!: string;

  @IsOptional()
  @IsString()
  goalMd?: string;

  @IsString()
  @IsNotEmpty()
  initialCwd!: string;

  /** Validated structurally in loadMissionsContent via assertValidVfsSnapshot(). */
  @IsDefined()
  initialFs!: unknown;

  /** Validated structurally in loadMissionsContent via assertValidChecks(). */
  @IsArray()
  @ArrayMinSize(1)
  checks!: unknown[];

  @IsArray()
  hints!: unknown[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedCommands?: string[];

  @IsOptional()
  @IsInt()
  @Min(1)
  maxStepsHint?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

/** Registry input type — the raw JSON files loaded by missions-content.registry.ts. */
export type MissionContentSource = {
  missions: MissionDefinition[];
};
