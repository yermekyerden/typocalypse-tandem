import { useEffect } from 'react';

import { useTerminalSession } from '@/store/terminalSession';
import { TerminalWindow } from '@/ui/components/TerminalWindow';

export function LibraryScreen() {
  const modules = useTerminalSession((s) => s.modules);
  const activeLessonId = useTerminalSession((s) => s.activeLessonId);
  const setActiveLesson = useTerminalSession((s) => s.setActiveLesson);
  const completedModuleId = useTerminalSession((s) => s.completedModuleId);
  const acknowledgeModuleCompletion = useTerminalSession((s) => s.acknowledgeModuleCompletion);

  const firstLessonId = modules[0]?.lessons[0]?.id ?? null;
  const currentLessonId = activeLessonId ?? firstLessonId;

  const currentModule = modules.find((module) =>
    module.lessons.some((lesson) => lesson.id === currentLessonId),
  );
  const currentLesson = currentModule?.lessons.find(
    (lesson) => lesson.id === currentLessonId,
  );
  const completedModule = completedModuleId
    ? modules.find((module) => module.id === completedModuleId)
    : null;

  useEffect(() => {
    if (!activeLessonId && firstLessonId) {
      setActiveLesson(firstLessonId);
    }
  }, [activeLessonId, firstLessonId, setActiveLesson]);

  return (
    <div className="flex flex-col gap-6 text-yellow-50 flex-1 min-h-0 h-full bg-mist-950 overflow-hidden">
      <section className="border border-yellow-400/25 bg-gradient-to-b from-mist-950 to-mist-900 p-5 shadow-lg flex flex-col flex-1 min-h-0 overflow-hidden">
        <div className="space-y-1">
          <p className="text-[11px] uppercase font-semibold tracking-[0.08em] text-yellow-300/80">
            Terminal
          </p>
          <h2 className="text-2xl font-semibold text-yellow-50">
            Sandbox for completing tasks
          </h2>
          <p className="text-sm text-yellow-100/80">
            Enter commands, progress is synchronized with modules.
          </p>
        </div>

        <div className="mt-4 flex-1 min-h-0 flex overflow-hidden">
          <TerminalWindow className="flex-1 min-h-0 h-full" />
        </div>
      </section>

      {currentLesson && currentModule && (
        <section className="border border-yellow-400/25 bg-gradient-to-b from-mist-950 to-mist-900 p-5 shadow-lg min-h-[220px] max-h-[320px] flex flex-col shrink-0 overflow-auto">
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

      {completedModule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-xl border border-yellow-400/40 bg-gradient-to-b from-mist-900 to-mist-950 p-6 shadow-2xl text-yellow-50">
            <div className="space-y-2 text-center">
              <p className="text-[11px] uppercase font-semibold tracking-[0.12em] text-emerald-200/80">
                Модуль завершён
              </p>
              <h3 className="text-2xl font-semibold text-emerald-100">
                Поздравляем! {completedModule.title} пройден.
              </h3>
              <p className="text-yellow-100/80 text-sm">
                Отличная работа — ты успешно выполнил все шаги этого модуля. Готов двигаться дальше?
              </p>
            </div>

            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={acknowledgeModuleCompletion}
                className="inline-flex items-center gap-2 rounded-md border border-emerald-300/60 bg-emerald-500/20 px-4 py-2 text-sm font-semibold text-emerald-100 shadow hover:bg-emerald-500/30 transition"
              >
                Продолжить обучение
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
