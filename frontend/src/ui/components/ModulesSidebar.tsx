import { useState } from 'react';
import { useLocation } from 'react-router-dom';

import { modules, type LessonStatus } from '@/mocks/modules';
import { useLessonSelection } from '@/store/lessonSelection';

const statusStyles: Record<LessonStatus, string> = {
  completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  active: 'bg-amber-100 text-amber-700 border-amber-200',
  locked: 'bg-slate-100 text-slate-600 border-slate-200',
};

export function ModulesSidebar() {
  const [openId, setOpenId] = useState<string | null>('cmd-basics');
  const location = useLocation();
  const selectLesson = useLessonSelection((s) => s.selectLesson);

  return (
    <aside className="space-y-3 rounded-lg border bg-card p-3 shadow-sm h-full min-h-[calc(100vh-200px)]">
      <div>
        <p className="text-xs font-semibold uppercase text-muted-foreground">Обучение</p>
        <h2 className="text-lg font-semibold">Модули</h2>
      </div>

      <nav aria-label="Учебные модули" className="space-y-2">
        {modules.map((module) => {
          const isOpen = openId === module.id;
          return (
            <div key={module.id} className="rounded-md border">
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : module.id)}
                className="flex w-full items-start justify-between gap-2 px-3 py-2 text-left hover:bg-muted/60"
              >
                <div className="space-y-0.5">
                  <p className="text-sm font-semibold">{module.title}</p>
                  <p className="text-xs text-muted-foreground">{module.description}</p>
                </div>
                <span className="text-xs text-muted-foreground">{isOpen ? '−' : '+'}</span>
              </button>

              {isOpen && (
                <ul className="space-y-1 border-t bg-muted/40 px-2 py-2 text-sm">
                  {module.lessons.map((lesson) => {
                    const isActiveRoute = location.pathname.includes(lesson.id);
                    return (
                      <li
                        key={lesson.id}
                        className={`flex items-center justify-between gap-2 rounded border px-2 py-1 ${
                          isActiveRoute ? 'border-primary/60 bg-primary/5' : 'border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="text-xs text-muted-foreground">{lesson.order}.</span>
                          <button
                            type="button"
                            onClick={() => selectLesson(lesson.id)}
                            className="truncate text-left text-primary hover:underline"
                          >
                            {lesson.title}
                          </button>
                        </div>
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide ${statusStyles[lesson.status]}`}
                        >
                          {lesson.status}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
