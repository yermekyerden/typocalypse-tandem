// E2E test constants — update these when the mapping changes:
//   E2E_LESSON_ID = 'ls-home'
//   E2E_COMPLETION_COMMANDS = ['ls']
//
// The mapped mission (ch01-m01-list-home) starts with /home/dojo/projects/ in the
// initial VFS. Running `ls` from /home/dojo produces "projects" on stdout, which
// satisfies the output_contains check.

/**
 * Authoritative ordered list of [lessonId, missionId] pairs.
 *
 * Stored as an array of tuples (not a plain object) so that runtime duplicate-key
 * detection is possible — object literals silently collapse duplicate keys before
 * any validator can inspect them.
 */
export const LESSON_MISSION_ENTRIES: ReadonlyArray<readonly [string, string]> = [
  // cmd-basics
  ['ls-home', 'ch01-m01-list-home'],
  ['cat-mission', 'ch01-m02-cat-mission'],
  ['ls-hidden', 'ch01-m03-ls-hidden'],
  ['cat-hidden', 'ch01-m04-cat-hidden'],
  ['pwd', 'ch01-m05-pwd'],
  ['cd-training', 'ch01-m06-cd-training'],
  ['cat-history', 'ch01-m07-cat-history'],
  ['mkdir-practice', 'ch01-m08-mkdir-practice'],
  ['touch-first-task', 'ch01-m09-touch-first-task'],
  // fs-basics
  ['cd-abs', 'ch02-m01-cd-abs'],
  ['cd-rel', 'ch02-m02-cd-rel'],
  ['archive-read', 'ch02-m03-archive-read'],
  ['cd-up', 'ch02-m04-cd-up'],
  ['cd-multi-up', 'ch02-m05-cd-multi-up'],
  ['archive-history', 'ch02-m06-archive-history'],
  // permissions
  ['ls-perms', 'ch03-m01-ls-perms'],
  ['chmod-owner', 'ch03-m02-chmod-owner'],
  ['cat-protected', 'ch03-m03-cat-protected'],
  ['ls-check', 'ch03-m04-ls-check'],
  ['cat-after', 'ch03-m05-cat-after'],
  // file-ops
  ['nano-rsschool-notes', 'ch04-m01-nano-rsschool-notes'],
  ['cat-rsschool-notes', 'ch04-m02-cat-rsschool-notes'],
  ['echo-mentor-message', 'ch04-m03-echo-mentor-message'],
  ['cat-create-journey', 'ch04-m04-cat-create-journey'],
  ['cat-rsschool-journey', 'ch04-m05-cat-rsschool-journey'],
  ['create-rsschool-stack', 'ch04-m06-create-rsschool-stack'],
] as const;

/**
 * Derived map for O(1) lookups by lessonId.
 * Built from LESSON_MISSION_ENTRIES at module load time.
 */
export const LESSON_MISSION_MAP: ReadonlyMap<string, string> = new Map(LESSON_MISSION_ENTRIES);

/**
 * Validates the mapping entries against the known lesson and mission ID sets.
 * Called once at application startup. Throws with a descriptive error on any violation.
 */
export function validateLessonMissionMapping(
  entries: ReadonlyArray<readonly [string, string]>,
  knownLessonIds: ReadonlySet<string>,
  knownMissionIds: ReadonlySet<string>,
): void {
  const seenLessonIds = new Set<string>();
  const seenMissionIds = new Set<string>();

  for (const [lessonId, missionId] of entries) {
    if (seenLessonIds.has(lessonId)) {
      throw new Error(
        `Duplicate lessonId in LESSON_MISSION_ENTRIES: "${lessonId}". Each lesson may appear at most once.`,
      );
    }
    seenLessonIds.add(lessonId);

    if (seenMissionIds.has(missionId)) {
      throw new Error(
        `Duplicate missionId in LESSON_MISSION_ENTRIES: "${missionId}" (for lesson "${lessonId}"). Each mission may appear at most once — duplicate missionIds corrupt the reverse mission→lesson lookup.`,
      );
    }
    seenMissionIds.add(missionId);

    if (!knownLessonIds.has(lessonId)) {
      throw new Error(
        `LESSON_MISSION_ENTRIES references unknown lessonId: "${lessonId}". Add the lesson to learning content or remove this mapping entry.`,
      );
    }

    if (!knownMissionIds.has(missionId)) {
      throw new Error(
        `LESSON_MISSION_ENTRIES references unknown missionId: "${missionId}" (for lesson "${lessonId}"). Add the mission or fix the mapping entry.`,
      );
    }
  }
}
