import { MissionCheck } from '../engine/engine.types';
import { loadMissionsContent } from './missions-content.loader';
import { MissionContentSource } from './missions-content.types';

function expectEngineChecks(checks: MissionCheck[]): MissionCheck[] {
  return checks;
}

function makeSource(checks: MissionCheck[]): MissionContentSource {
  return {
    missions: [
      {
        id: 'm1',
        version: 1,
        chapterId: 'ch-01',
        title: 'Mission 1',
        difficulty: 'easy',
        estimatedMinutes: 5,
        shortDescription: 'Test mission',
        descriptionMd: 'Do the thing.',
        initialCwd: '/home/dojo',
        initialFs: {
          root: {
            type: 'dir',
            name: '',
            children: [],
          },
        },
        checks,
        hints: [],
      },
    ],
  };
}

describe('loadMissionsContent', () => {
  it('loads a mission with valid engine check types', () => {
    const source = makeSource([{ id: 'check-1', type: 'cwd_is', expectedPath: '/home/dojo' }]);

    const result = loadMissionsContent(source);
    const mission = result.missionById.get('m1');

    expect(mission).toBeDefined();
    const checks = expectEngineChecks(mission!.checks);

    expect(checks[0]?.type).toBe('cwd_is');
  });

  it('rejects unknown check type values', () => {
    const source = makeSource([
      {
        id: 'check-1',
        type: 'not_real',
      } as MissionCheck,
    ]);

    expect(() => loadMissionsContent(source)).toThrow(/type must be one of/);
  });
});
