import { plainToInstance } from 'class-transformer';
import { ValidationError, validateSync } from 'class-validator';
import {
  LessonContentDefinition,
  LessonDetail,
  LessonHeuristicStatus,
  LearningContentSource,
  LearningOverviewResponse,
  ModuleContentDefinition,
} from '../learning-content/learning-content.types';

export type LoadedLearningContent = {
  overview: LearningOverviewResponse;
  lessonDetailsById: Map<string, LessonDetail>;
};

export function loadLearningContent(source: LearningContentSource): LoadedLearningContent {
  const modules = source.modules.map((module, index) =>
    validateEntity(ModuleContentDefinition, module, `module[${index}]`),
  );
  const lessons = source.lessons.map((lesson, index) =>
    validateEntity(LessonContentDefinition, lesson, `lesson[${index}]`),
  );

  assertUnique(modules, (module) => module.id, 'module id');
  assertUnique(modules, (module) => module.slug, 'module slug');
  assertUnique(modules, (module) => module.order.toString(), 'module order');

  assertUnique(lessons, (lesson) => lesson.id, 'lesson id');
  assertUnique(lessons, (lesson) => lesson.slug, 'lesson slug');

  assertSequential(
    modules.map((module) => module.order),
    'module',
  );

  const moduleById = new Map(modules.map((module) => [module.id, module]));
  const lessonById = new Map(lessons.map((lesson) => [lesson.id, lesson]));

  for (const lesson of lessons) {
    if (!moduleById.has(lesson.moduleId)) {
      throw new Error(
        `Invalid lesson module reference: lesson "${lesson.id}" points to unknown module "${lesson.moduleId}"`,
      );
    }
  }

  const lessonsByModule = new Map<string, LessonContentDefinition[]>();
  for (const lesson of lessons) {
    const forModule = lessonsByModule.get(lesson.moduleId) ?? [];
    forModule.push(lesson);
    lessonsByModule.set(lesson.moduleId, forModule);
  }

  const orderedModules = [...modules].sort((a, b) => a.order - b.order);
  const overviewModules = orderedModules.map((module) => {
    const moduleLessons = [...(lessonsByModule.get(module.id) ?? [])].sort(
      (a, b) => a.order - b.order,
    );

    assertUnique(module.lessonIds, (id) => id, `lesson id reference in module "${module.id}"`);
    assertSequential(
      moduleLessons.map((lesson) => lesson.order),
      `lesson order in module "${module.id}"`,
    );

    const lessonIdsByOrder = moduleLessons.map((lesson) => lesson.id);
    for (const lessonId of module.lessonIds) {
      const lesson = lessonById.get(lessonId);
      if (!lesson) {
        throw new Error(`Unknown lesson "${lessonId}" referenced by module "${module.id}"`);
      }
      if (lesson.moduleId !== module.id) {
        throw new Error(
          `Lesson linkage mismatch: lesson "${lessonId}" belongs to module "${lesson.moduleId}" but is referenced by "${module.id}"`,
        );
      }
    }

    if (module.lessonIds.length !== lessonIdsByOrder.length) {
      throw new Error(
        `Module "${module.id}" lesson list mismatch: expected ${module.lessonIds.length} lessons, got ${lessonIdsByOrder.length}`,
      );
    }

    if (!sameItemsInSameOrder(module.lessonIds, lessonIdsByOrder)) {
      throw new Error(
        `Lesson ordering mismatch in module "${module.id}": lessonIds must match lesson order values`,
      );
    }

    return {
      id: module.id,
      slug: module.slug,
      title: module.title,
      description: module.description,
      order: module.order,
      lessons: moduleLessons.map((lesson) => ({
        id: lesson.id,
        slug: lesson.slug,
        title: lesson.title,
        order: lesson.order,
        status: 'locked' satisfies LessonHeuristicStatus,
      })),
    };
  });

  const firstLessonId = overviewModules[0]?.lessons[0]?.id;
  const overview: LearningOverviewResponse = {
    modules: overviewModules.map((module) => ({
      ...module,
      lessons: module.lessons.map((lesson) => ({
        ...lesson,
        status: lesson.id === firstLessonId ? 'active' : 'locked',
      })),
    })),
  };

  const lessonDetailsById = new Map<string, LessonDetail>(
    lessons.map((lesson) => [
      lesson.id,
      {
        id: lesson.id,
        moduleId: lesson.moduleId,
        slug: lesson.slug,
        title: lesson.title,
        order: lesson.order,
        theoryMarkdown: lesson.theoryMarkdown,
        taskDescription: lesson.taskDescription,
        ...(lesson.hints ? { hints: [...lesson.hints] } : {}),
        ...(lesson.runtime
          ? {
              runtime: {
                expectedCommand: lesson.runtime.expectedCommand,
                ...(lesson.runtime.expectedCwd
                  ? { expectedCwd: lesson.runtime.expectedCwd }
                  : {}),
                ...(lesson.runtime.sampleOutput
                  ? { sampleOutput: lesson.runtime.sampleOutput }
                  : {}),
              },
            }
          : {}),
      },
    ]),
  );

  return {
    overview,
    lessonDetailsById,
  };
}

function validateEntity<T extends object>(dto: new () => T, value: unknown, name: string): T {
  const entity = plainToInstance(dto, value);
  const errors = validateSync(entity, {
    whitelist: true,
    forbidNonWhitelisted: true,
  });

  if (errors.length > 0) {
    const details = flattenValidationErrors(errors).join('; ');
    throw new Error(`Invalid ${name}: ${details}`);
  }

  return entity;
}

function assertUnique<T>(items: T[], keyFn: (item: T) => string, label: string): void {
  const seen = new Set<string>();
  for (const item of items) {
    const key = keyFn(item);
    if (seen.has(key)) {
      throw new Error(`Duplicate ${label}: "${key}"`);
    }
    seen.add(key);
  }
}

function assertSequential(values: number[], label: string): void {
  const ordered = [...values].sort((a, b) => a - b);
  for (let index = 0; index < ordered.length; index += 1) {
    const expected = index + 1;
    if (ordered[index] !== expected) {
      throw new Error(`Invalid ${label} order: values must be sequential starting from 1`);
    }
  }
}

function sameItemsInSameOrder(left: string[], right: string[]): boolean {
  if (left.length !== right.length) {
    return false;
  }
  return left.every((item, index) => item === right[index]);
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
