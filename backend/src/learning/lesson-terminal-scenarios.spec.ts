import { getLessonAttemptScenario } from './lesson-terminal-scenarios';

describe('getLessonAttemptScenario', () => {
  it('returns a cmd-basics scenario', () => {
    const scenario = getLessonAttemptScenario('ls-home');

    expect(scenario).toEqual(
      expect.objectContaining({
        initialCwd: '/home/student',
        allowedCommands: expect.arrayContaining(['ls']),
      }),
    );
  });

  it('returns an fs-basics scenario', () => {
    const scenario = getLessonAttemptScenario('archive-read');

    expect(scenario).toEqual(
      expect.objectContaining({
        initialCwd: '/var/tmp/rsschool',
        allowedCommands: expect.arrayContaining(['cd', 'cat']),
        checks: expect.arrayContaining([
          expect.objectContaining({
            type: 'cwd_is',
            expectedPath: '/var/tmp/rsschool/stage1',
          }),
        ]),
      }),
    );
  });

  it('returns a permissions scenario', () => {
    const scenario = getLessonAttemptScenario('cat-protected');

    expect(scenario).toEqual(
      expect.objectContaining({
        initialCwd: '/home/student',
        allowedCommands: expect.arrayContaining(['chmod']),
        checks: expect.arrayContaining([
          expect.objectContaining({
            type: 'path_mode_is',
            expectedMode: '600',
          }),
        ]),
      }),
    );
  });

  it('returns a file-ops scenario', () => {
    const scenario = getLessonAttemptScenario('cat-rsschool-journey');

    expect(scenario).toEqual(
      expect.objectContaining({
        initialCwd: '/home/student',
        allowedCommands: expect.arrayContaining(['wc']),
        checks: expect.arrayContaining([
          expect.objectContaining({
            type: 'output_contains',
            text: '3 rsschool_journey.txt',
          }),
        ]),
      }),
    );
  });

  it('returns null for unknown lessons', () => {
    expect(getLessonAttemptScenario('unknown-lesson')).toBeNull();
  });
});
