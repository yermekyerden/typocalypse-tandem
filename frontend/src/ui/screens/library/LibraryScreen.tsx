import { useEffect } from 'react';

import { useTerminalSession } from '@/store/terminalSession';
import { TerminalWindow } from '@/ui/components/TerminalWindow';

export function LibraryScreen() {
  const modules = useTerminalSession((s) => s.modules);
  const activeLessonId = useTerminalSession((s) => s.activeLessonId);
  const setActiveLesson = useTerminalSession((s) => s.setActiveLesson);

  const firstLessonId = modules[0]?.lessons[0]?.id ?? null;
  const currentLessonId = activeLessonId ?? firstLessonId;

  const currentModule = modules.find((module) =>
    module.lessons.some((lesson) => lesson.id === currentLessonId),
  );
  const currentLesson = currentModule?.lessons.find(
    (lesson) => lesson.id === currentLessonId,
  );

  useEffect(() => {
    if (!activeLessonId && firstLessonId) {
      setActiveLesson(firstLessonId);
    }
  }, [activeLessonId, firstLessonId, setActiveLesson]);

  return (
    <div className="space-y-4 text-yellow-50 flex-1">
      <section className="border border-yellow-400/25 bg-gradient-to-b from-mist-950 to-mist-900 p-5 shadow-lg min-h-[420px] flex flex-col">
        <div className="space-y-1">
          <p className="text-[11px] uppercase font-semibold tracking-[0.08em] text-yellow-300/80">
            Terminal
          </p>
          <h2 className="text-2xl font-semibold text-yellow-50">
            Песочница для выполнения заданий
          </h2>
          <p className="text-sm text-yellow-100/80">
            Вводи команды, прогресс синхронизируется с модулями.
          </p>
        </div>

        <div className="mt-4 flex-1">
          <TerminalWindow height="100%" />
        </div>
      </section>

      {currentLesson && currentModule && (
        <section className="border border-yellow-400/25 bg-gradient-to-b from-mist-950 to-mist-900 p-5 shadow-lg min-h-[220px] flex flex-col">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="text-[11px] uppercase font-semibold tracking-[0.08em] text-yellow-300/80">
                {currentModule.title}
              </p>
              <h2 className="text-2xl font-semibold text-yellow-50">
                {currentLesson.title}
              </h2>
            </div>
          </div>

          <div className="mt-4 space-y-4 text-sm leading-relaxed">
            <div className="space-y-1.5">
              <p className="font-semibold text-yellow-100">Theory</p>
              <p className="text-yellow-100/80">{currentLesson.theory || '—'}</p>
            </div>
            <div className="space-y-1.5">
              <p className="font-semibold text-yellow-100">Task</p>
              <p className="text-yellow-100/80 whitespace-pre-wrap">
                {currentLesson.task || '—'}
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
