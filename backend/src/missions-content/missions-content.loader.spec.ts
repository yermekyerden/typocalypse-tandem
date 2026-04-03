import { MissionCheck, VfsFileNode } from '../engine/engine.types';
import { loadMissionsContent } from './missions-content.loader';
import { vfsResolve } from '../engine/vfs/vfs.service';
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

  it('preserves explicit permissions on VFS file nodes', () => {
    const source: MissionContentSource = {
      missions: [
        {
          id: 'm1',
          version: 1,
          chapterId: 'ch-01',
          title: 'Perm test',
          difficulty: 'easy',
          estimatedMinutes: 5,
          shortDescription: 'Test',
          descriptionMd: 'Test.',
          initialCwd: '/home/dojo',
          initialFs: {
            root: {
              type: 'dir',
              name: '',
              children: [
                { type: 'file', name: 'secret.txt', content: 'hidden', permissions: '000' },
              ],
            },
          },
          checks: [{ id: 'c1', type: 'exit_code_is', expectedExitCode: 0 }],
          hints: [],
        },
      ],
    };

    const result = loadMissionsContent(source);
    const mission = result.missionById.get('m1');
    const file = vfsResolve(mission!.initialFs, '/secret.txt') as VfsFileNode;

    expect(file.permissions).toBe('000');
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
