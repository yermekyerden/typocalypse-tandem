import { useEffect } from 'react';

import { modules } from '@/mocks/modules';
import { useLessonSelection } from '@/store/lessonSelection';

export function LibraryScreen() {
  const selectedLessonId = useLessonSelection((s) => s.selectedLessonId);
  const selectLesson = useLessonSelection((s) => s.selectLesson);

  const firstLessonId = modules[0]?.lessons[0]?.id ?? null;
  const currentLessonId = selectedLessonId ?? firstLessonId;

  let currentLesson = null;
  let currentModule = null;
  for (const module of modules) {
    const lesson = module.lessons.find((l) => l.id === currentLessonId);
    if (lesson) {
      currentLesson = lesson;
      currentModule = module;
      break;
    }
  }

  useEffect(() => {
    if (!selectedLessonId && firstLessonId) {
      selectLesson(firstLessonId);
    }
  }, [selectedLessonId, firstLessonId, selectLesson]);

  return (
    <div className="space-y-4 text-yellow-50">
      <section className="border border-yellow-400/25 bg-gradient-to-b from-mist-950 to-mist-900 p-5 shadow-lg min-h-[420px] flex flex-col">
        <div className="space-y-1">
          <p className="text-[11px] uppercase font-semibold tracking-[0.08em] text-yellow-300/80">
            Terminal (mock)
          </p>
          <h2 className="text-2xl font-semibold text-yellow-50">
            Песочница для выполнения заданий
          </h2>
          <p className="text-sm text-yellow-100/80">
            Здесь будет полноценный терминал. Сейчас — заглушка, чтобы не оставить пустой экран.
          </p>
        </div>

        <div className="mt-4 border border-yellow-400/30 bg-mist-950/70 p-4 font-mono text-sm text-yellow-100 shadow-inner flex-1">
          <div className="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-[0.08em] text-yellow-300/80">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400"></span>
            placeholder mock terminal
          </div>
          <div className="space-y-1">
            <p>
              <span className="text-amber-300">user@dojo</span>:<span className="text-sky-300">~</span>$ ls
            </p>
            <p>readme.md modules tasks</p>
            <p>
              <span className="text-amber-300">user@dojo</span>:<span className="text-sky-300">~/modules</span>$ cat lesson.txt
            </p>
            <p>Task: Print the list of files in your home directory.</p>
            <p>
              <span className="text-amber-300">user@dojo</span>:<span className="text-sky-300">~</span>$ █
            </p>
          </div>
        </div>
      </section>

      {currentLesson && currentModule && (
        <section className="border border-yellow-400/25 bg-gradient-to-b from-mist-950 to-mist-900 p-5 shadow-lg min-h-[220px] flex flex-col">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="text-[11px] uppercase font-semibold tracking-[0.08em] text-yellow-300/80">
                {currentModule.title}
              </p>
              <h2 className="text-2xl font-semibold text-yellow-50">{currentLesson.title}</h2>
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
