// E2E test constants — update these when the mapping changes:
//   E2E_LESSON_ID = 'ls-home'
//   E2E_COMPLETION_COMMANDS = ['ls']
//
// The mapped mission (ch01-m03-list-home) starts with /home/dojo/projects/ in the
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
  ['ls-home', 'ch01-m03-list-home'],
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
