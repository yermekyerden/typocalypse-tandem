/**
 * Temporary frontend-side bridge until backend starts returning mission ids for lessons.
 * The current backend contracts expose lessons and missions separately, so terminal attempts
 * cannot be started from a lesson without this mapping.
 */
export const lessonMissionMap: Record<string, string> = {
  'ls-home': 'ch01-m01-print-cwd',
  'cat-mission': 'ch01-m02-create-dirs',
};
