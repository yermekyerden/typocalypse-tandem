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

  it('returns null for lessons without terminal runtime yet', () => {
    expect(getLessonAttemptScenario('ls-perms')).toBeNull();
  });
});
