import { learningContentSource } from '../learning-content/learning-content.registry';
import { LearningContentSource } from '../learning-content/learning-content.types';
import { validateLessonMissionMapping } from '../learning-content/lesson-mission-mapping';
import { loadLearningContent } from './learning-content.loader';

describe('loadLearningContent', () => {
  it('loads valid source and derives overview/detail read models', () => {
    const loaded = loadLearningContent(learningContentSource);

    expect(loaded.overview.modules.length).toBeGreaterThan(0);

    const orderedLessons = loaded.overview.modules.flatMap((module) => module.lessons);
    expect(orderedLessons.length).toBeGreaterThan(0);
    expect(orderedLessons[0].status).toBe('active');
    expect(orderedLessons.slice(1).every((lesson) => lesson.status === 'locked')).toBe(true);

    const firstLessonId = orderedLessons[0].id;
    const detail = loaded.lessonDetailsById.get(firstLessonId);
    expect(detail).toEqual(
      expect.objectContaining({
        id: firstLessonId,
        /* eslint-disable @typescript-eslint/no-unsafe-assignment */
        theoryMarkdown: expect.any(String),
        taskDescription: expect.any(String),
        /* eslint-enable @typescript-eslint/no-unsafe-assignment */
      }),
    );
    expect(detail).not.toHaveProperty('runtime');
    expect(detail).not.toHaveProperty('expectedCommand');
  });

  it('throws when lesson slug is duplicated', () => {
    const source: LearningContentSource = structuredClone(learningContentSource);
    source.lessons[1].slug = source.lessons[0].slug;

    expect(() => loadLearningContent(source)).toThrow(/duplicate lesson slug/i);
  });

  it('throws when module references an unknown lesson', () => {
    const source: LearningContentSource = structuredClone(learningContentSource);
    source.modules[0].lessonIds = [...source.modules[0].lessonIds, 'unknown-lesson-id'];

    expect(() => loadLearningContent(source)).toThrow(/unknown lesson/i);
  });

  it('throws when lesson order is not sequential inside a module', () => {
    const source: LearningContentSource = structuredClone(learningContentSource);
    source.lessons[0].order = 99;

    expect(() => loadLearningContent(source)).toThrow(/sequential/i);
  });
});

describe('full curriculum structure (4 modules, 26 lessons)', () => {
  it('cmd-basics has 9 lessons with expected IDs', () => {
    const loaded = loadLearningContent(learningContentSource);
    const mod = loaded.overview.modules.find((m) => m.id === 'cmd-basics');

    expect(mod?.lessons).toHaveLength(9);
    const ids = mod!.lessons.map((l) => l.id);
    expect(ids).toContain('ls-home');
    expect(ids).toContain('ls-hidden');
    expect(ids).toContain('pwd');
    expect(ids).toContain('mkdir-practice');
    expect(ids).toContain('touch-first-task');
  });

  it('fs-basics module exists with 6 lessons', () => {
    const loaded = loadLearningContent(learningContentSource);
    const mod = loaded.overview.modules.find((m) => m.id === 'fs-basics');

    expect(mod?.lessons).toHaveLength(6);
    const ids = mod!.lessons.map((l) => l.id);
    expect(ids).toContain('cd-abs');
    expect(ids).toContain('cd-up');
    expect(ids).toContain('cd-multi-up');
  });

  it('permissions module exists with 5 lessons', () => {
    const loaded = loadLearningContent(learningContentSource);
    const mod = loaded.overview.modules.find((m) => m.id === 'permissions');

    expect(mod?.lessons).toHaveLength(5);
    const ids = mod!.lessons.map((l) => l.id);
    expect(ids).toContain('ls-perms');
    expect(ids).toContain('chmod-owner');
    expect(ids).toContain('cat-after');
  });

  it('file-ops module exists with 6 lessons', () => {
    const loaded = loadLearningContent(learningContentSource);
    const mod = loaded.overview.modules.find((m) => m.id === 'file-ops');

    expect(mod?.lessons).toHaveLength(6);
    const ids = mod!.lessons.map((l) => l.id);
    expect(ids).toContain('echo-mentor-message');
    expect(ids).toContain('cat-create-journey');
    expect(ids).toContain('create-rsschool-stack');
  });

  it('total overview has 4 modules and 26 lessons', () => {
    const loaded = loadLearningContent(learningContentSource);

    expect(loaded.overview.modules).toHaveLength(4);
    const totalLessons = loaded.overview.modules.reduce((sum, m) => sum + m.lessons.length, 0);
    expect(totalLessons).toBe(26);
  });
});

describe('validateLessonMissionMapping', () => {
  const knownLessons = new Set(['lesson-a', 'lesson-b']);
  const knownMissions = new Set(['mission-x', 'mission-y']);

  it('passes for valid entries', () => {
    expect(() =>
      validateLessonMissionMapping([['lesson-a', 'mission-x']], knownLessons, knownMissions),
    ).not.toThrow();
  });

  it('passes for an empty entries array', () => {
    expect(() => validateLessonMissionMapping([], knownLessons, knownMissions)).not.toThrow();
  });

  it('throws for an entry with an unknown lessonId', () => {
    expect(() =>
      validateLessonMissionMapping([['unknown-lesson', 'mission-x']], knownLessons, knownMissions),
    ).toThrow(/unknown lessonId.*unknown-lesson/i);
  });

  it('throws for an entry with an unknown missionId', () => {
    expect(() =>
      validateLessonMissionMapping([['lesson-a', 'unknown-mission']], knownLessons, knownMissions),
    ).toThrow(/unknown missionId.*unknown-mission/i);
  });

  it('throws for duplicate lessonId in entries', () => {
    expect(() =>
      validateLessonMissionMapping(
        [
          ['lesson-a', 'mission-x'],
          ['lesson-a', 'mission-y'],
        ],
        knownLessons,
        knownMissions,
      ),
    ).toThrow(/duplicate lessonId.*lesson-a/i);
  });

  it('throws for duplicate missionId in entries', () => {
    expect(() =>
      validateLessonMissionMapping(
        [
          ['lesson-a', 'mission-x'],
          ['lesson-b', 'mission-x'],
        ],
        knownLessons,
        knownMissions,
      ),
    ).toThrow(/duplicate missionId.*mission-x/i);
  });
});
