import { useState } from 'react';
import { type LessonStatus } from '@/mocks/modules';
import { useTerminalSession } from '@/store/terminalSession';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/ui/components/ui/accordion';

const statusStyles: Record<LessonStatus, string> = {
  completed: 'bg-emerald-400/10 text-emerald-200 border-emerald-400/30',
  active: 'bg-amber-400/10 text-amber-200 border-amber-400/30',
  locked: 'bg-slate-200/5 text-slate-200 border-slate-200/20',
};

export function ModulesSidebar() {
  const [openId, setOpenId] = useState<string | null>('cmd-basics');
  const modules = useTerminalSession((s) => s.modules);
  const selectedLessonId = useTerminalSession((s) => s.activeLessonId);
  const setActiveLesson = useTerminalSession((s) => s.setActiveLesson);

  return (
    <aside className="w-[320px] shrink-0 space-y-4 border border-yellow-400/30 bg-gradient-to-b from-mist-950 to-mist-900 p-4 shadow-lg text-yellow-50 h-full min-h-[calc(100vh-140px)] overflow-y-auto">
      <div className="space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-yellow-300/80">
          Learning
        </p>
        <h2 className="text-xl font-semibold text-yellow-100">Modules</h2>
      </div>

      <Accordion
        type="single"
        collapsible
        value={openId ?? undefined}
        onValueChange={(val) => setOpenId(val || null)}
        className="space-y-3"
      >
        {modules.map((module) => (
          <AccordionItem
            key={module.id}
            value={module.id}
            className="overflow-hidden border border-yellow-400/20 bg-white/5 backdrop-blur-sm"
          >
            <AccordionTrigger className="px-3 py-2 text-left text-yellow-50 hover:bg-yellow-400/10 data-[state=open]:bg-yellow-400/15">
              <div className="space-y-0.5 pr-3">
                <p className="text-sm font-semibold">{module.title}</p>
                <p className="text-xs text-yellow-100/80">{module.description}</p>
              </div>
            </AccordionTrigger>
            <AccordionContent className="border-t border-yellow-400/15 bg-mist-900/60 px-3 py-2">
              <ul className="space-y-1 text-sm">
                {module.lessons.map((lesson) => {
                  const isActive = selectedLessonId === lesson.id;
                  return (
                    <li
                      key={lesson.id}
                      className={`flex items-center justify-between gap-2 border px-2 py-1 transition ${
                        isActive
                          ? 'border-yellow-400/60 bg-yellow-400/10 shadow-[0_0_0_1px_rgba(250,204,21,0.15)]'
                          : 'border-yellow-400/10 hover:border-yellow-400/30 hover:bg-yellow-400/5'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-xs text-yellow-200/80">
                          {lesson.order}.
                        </span>
                        <button
                          type="button"
                          onClick={() => setActiveLesson(lesson.id)}
                          className="truncate text-left text-yellow-50 hover:underline"
                        >
                          {lesson.title}
                        </button>
                      </div>
                      <span
                        className={`border px-2 py-0.5 text-[10px] uppercase tracking-wide ${statusStyles[lesson.status]}`}
                      >
                        {lesson.status}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </aside>
  );
}
