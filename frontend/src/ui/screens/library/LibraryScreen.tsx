import { useMemo } from 'react';

import { modules } from '@/mocks/modules';
import { useLessonSelection } from '@/store/lessonSelection';

export function LibraryScreen() {
  const selectedLessonId = useLessonSelection((s) => s.selectedLessonId);
  const selectLesson = useLessonSelection((s) => s.selectLesson);

  const firstLessonId = modules[0]?.lessons[0]?.id ?? null;
  const currentLessonId = selectedLessonId ?? firstLessonId;

  const { currentLesson, currentModule } = useMemo(() => {
    for (const module of modules) {
      const lesson = module.lessons.find((l) => l.id === currentLessonId);
      if (lesson) return { currentLesson: lesson, currentModule: module };
    }
    return { currentLesson: null, currentModule: null };
  }, [currentLessonId]);

  if (!selectedLessonId && firstLessonId) {
    selectLesson(firstLessonId);
  }

  return (
    <div className="space-y-4">

      <section className="rounded-lg border bg-card p-3 shadow-sm">
      </section>

      {currentLesson && currentModule && (
        <section className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase font-semibold text-muted-foreground">
                {currentModule.title}
              </p>
              <h2 className="text-xl font-semibold">{currentLesson.title}</h2>
            </div>
          </div>

          <div className="mt-3 space-y-3 text-sm leading-relaxed">
            <div>
              <p className="font-semibold">Theory</p>
              <p className="text-muted-foreground">{currentLesson.theory || '—'}</p>
            </div>
            <div>
              <p className="font-semibold">Task</p>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {currentLesson.task || '—'}
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
