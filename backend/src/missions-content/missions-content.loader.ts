import { plainToInstance } from 'class-transformer';
import { ValidationError, validateSync } from 'class-validator';
import { MissionDefinition, MissionContentSource } from './missions-content.types';

export type VfsDirNode = {
  type: 'dir';
  name: string;
  children: VfsNode[];
};

export type VfsFileNode = {
  type: 'file';
  name: string;
  content: string;
};

export type VfsNode = VfsDirNode | VfsFileNode;

export type VfsSnapshot = {
  root: VfsDirNode;
  budgets?: {
    maxNodes: number;
    maxDepth: number;
    maxFileBytes: number;
  };
};

export type MissionCheck = {
  id: string;
  type: string;
  [key: string]: unknown;
};

export type MissionHint = {
  id: string;
  order: number;
  textMd: string;
  unlockAfterAttempts?: number;
  unlockAfterSeconds?: number;
};

export type LoadedMission = {
  id: string;
  version: number;
  chapterId: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedMinutes: number;
  shortDescription: string;
  descriptionMd: string;
  goalMd?: string;
  initialCwd: string;
  initialFs: VfsSnapshot;
  checks: MissionCheck[];
  hints: MissionHint[];
  allowedCommands?: string[];
  maxStepsHint?: number;
  tags?: string[];
};

export type LoadedMissionHeader = {
  id: string;
  version: number;
  chapterId: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedMinutes: number;
  shortDescription: string;
  tags?: string[];
};

export type LoadedMissionsContent = {
  missions: LoadedMission[];
  missionById: Map<string, LoadedMission>;
};

/** Loads and validates mission JSON content at application startup. Throws on invalid data. */
export function loadMissionsContent(source: MissionContentSource): LoadedMissionsContent {
  const missions = source.missions.map((raw, index) => {
    const definition = validateMissionDefinition(raw, `mission[${index}]`);
    const initialFs = assertValidVfsSnapshot(definition.initialFs, `mission[${index}].initialFs`);
    const checks = assertValidChecks(definition.checks, `mission[${index}].checks`);
    const hints = assertValidHints(definition.hints, `mission[${index}].hints`);

    const loaded: LoadedMission = {
      id: definition.id,
      version: definition.version,
      chapterId: definition.chapterId,
      title: definition.title,
      difficulty: definition.difficulty,
      estimatedMinutes: definition.estimatedMinutes,
      shortDescription: definition.shortDescription,
      descriptionMd: definition.descriptionMd,
      initialCwd: definition.initialCwd,
      initialFs,
      checks,
      hints,
    };

    if (definition.goalMd) loaded.goalMd = definition.goalMd;
    if (definition.allowedCommands) loaded.allowedCommands = definition.allowedCommands;
    if (definition.maxStepsHint) loaded.maxStepsHint = definition.maxStepsHint;
    if (definition.tags) loaded.tags = definition.tags;

    return loaded;
  });

  assertUniqueIds(missions, 'mission id');

  const missionById = new Map(missions.map((m) => [m.id, m]));

  return { missions, missionById };
}

function validateMissionDefinition(raw: unknown, name: string): MissionDefinition {
  const definition = plainToInstance(MissionDefinition, raw);
  const errors = validateSync(definition, { whitelist: true, forbidNonWhitelisted: false });

  if (errors.length > 0) {
    const details = flattenValidationErrors(errors).join('; ');
    throw new Error(`Invalid ${name}: ${details}`);
  }

  return definition;
}

function assertValidVfsSnapshot(raw: unknown, name: string): VfsSnapshot {
  if (typeof raw !== 'object' || raw === null) {
    throw new Error(`${name} must be an object`);
  }

  const snapshot = raw as Record<string, unknown>;

  if (typeof snapshot['root'] !== 'object' || snapshot['root'] === null) {
    throw new Error(`${name}.root must be an object`);
  }

  const root = assertValidVfsDirNode(snapshot['root'], `${name}.root`);
  if (root.name !== '') {
    throw new Error(`${name}.root.name must be "" (empty string) for the root node`);
  }

  const result: VfsSnapshot = { root };

  if (snapshot['budgets'] !== undefined) {
    const budgets = snapshot['budgets'] as Record<string, unknown>;
    if (
      typeof budgets['maxNodes'] !== 'number' ||
      typeof budgets['maxDepth'] !== 'number' ||
      typeof budgets['maxFileBytes'] !== 'number'
    ) {
      throw new Error(`${name}.budgets must have numeric maxNodes, maxDepth, maxFileBytes`);
    }
    result.budgets = {
      maxNodes: budgets['maxNodes'],
      maxDepth: budgets['maxDepth'],
      maxFileBytes: budgets['maxFileBytes'],
    };
  }

  return result;
}

function assertValidVfsDirNode(raw: unknown, path: string): VfsDirNode {
  if (typeof raw !== 'object' || raw === null) {
    throw new Error(`${path} must be a VfsDirNode object`);
  }

  const node = raw as Record<string, unknown>;

  if (node['type'] !== 'dir') {
    throw new Error(`${path}.type must be "dir"`);
  }

  if (typeof node['name'] !== 'string') {
    throw new Error(`${path}.name must be a string`);
  }

  if (node['name'] !== '' && node['name'].includes('/')) {
    throw new Error(`${path}.name must not contain "/"`);
  }

  if (!Array.isArray(node['children'])) {
    throw new Error(`${path}.children must be an array`);
  }

  const children = (node['children'] as unknown[]).map((child, i) =>
    assertValidVfsNode(child, `${path}.children[${i}]`),
  );

  return { type: 'dir', name: node['name'], children };
}

function assertValidVfsNode(raw: unknown, path: string): VfsNode {
  if (typeof raw !== 'object' || raw === null) {
    throw new Error(`${path} must be a VfsNode object`);
  }

  const node = raw as Record<string, unknown>;

  if (node['type'] === 'dir') {
    return assertValidVfsDirNode(raw, path);
  }

  if (node['type'] === 'file') {
    if (typeof node['name'] !== 'string' || node['name'].includes('/')) {
      throw new Error(`${path}.name must be a string without "/"`);
    }
    if (typeof node['content'] !== 'string') {
      throw new Error(`${path}.content must be a string`);
    }
    return { type: 'file', name: node['name'], content: node['content'] };
  }

  throw new Error(`${path}.type must be "dir" or "file", got: ${String(node['type'])}`);
}

const VALID_CHECK_TYPES = new Set([
  'cwd_is',
  'exit_code_is',
  'path_exists',
  'path_not_exists',
  'file_content_equals',
  'file_content_matches',
  'output_contains',
  'output_matches',
]);

function assertValidChecks(raw: unknown[], name: string): MissionCheck[] {
  return raw.map((check, i) => {
    if (typeof check !== 'object' || check === null) {
      throw new Error(`${name}[${i}] must be an object`);
    }

    const c = check as Record<string, unknown>;

    if (typeof c['id'] !== 'string' || c['id'].length === 0) {
      throw new Error(`${name}[${i}].id must be a non-empty string`);
    }

    if (typeof c['type'] !== 'string' || !VALID_CHECK_TYPES.has(c['type'])) {
      throw new Error(`${name}[${i}].type must be one of: ${[...VALID_CHECK_TYPES].join(', ')}`);
    }

    return c as MissionCheck;
  });
}

function assertValidHints(raw: unknown[], name: string): MissionHint[] {
  return raw.map((hint, i) => {
    if (typeof hint !== 'object' || hint === null) {
      throw new Error(`${name}[${i}] must be an object`);
    }

    const h = hint as Record<string, unknown>;

    if (typeof h['id'] !== 'string' || h['id'].length === 0) {
      throw new Error(`${name}[${i}].id must be a non-empty string`);
    }

    if (typeof h['order'] !== 'number') {
      throw new Error(`${name}[${i}].order must be a number`);
    }

    if (typeof h['textMd'] !== 'string') {
      throw new Error(`${name}[${i}].textMd must be a string`);
    }

    return h as MissionHint;
  });
}

function assertUniqueIds(missions: LoadedMission[], label: string): void {
  const seen = new Set<string>();
  for (const mission of missions) {
    if (seen.has(mission.id)) {
      throw new Error(`Duplicate ${label}: "${mission.id}"`);
    }
    seen.add(mission.id);
  }
}

function flattenValidationErrors(errors: ValidationError[]): string[] {
  const messages: string[] = [];

  for (const error of errors) {
    if (error.constraints) {
      messages.push(...Object.values(error.constraints));
    }
    if (error.children && error.children.length > 0) {
      messages.push(...flattenValidationErrors(error.children));
    }
  }

  return messages;
}
