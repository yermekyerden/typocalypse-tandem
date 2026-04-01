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
