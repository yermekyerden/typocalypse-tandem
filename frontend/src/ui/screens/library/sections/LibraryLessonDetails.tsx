import { type Lesson } from '@/mocks/modules';
import { AchievementStars } from '@/ui/components/AchievementStars';

type LibraryLessonDetailsProps = {
  lesson: Lesson;
  moduleTitle: string;
  progress: {
    completed: number;
    total: number;
  };
};

export function LibraryLessonDetails({
  lesson,
  moduleTitle,
  progress,
}: LibraryLessonDetailsProps) {
  return (
    <section className="flex max-h-[320px] min-h-[220px] shrink-0 flex-col overflow-auto border border-yellow-400/25 bg-gradient-to-b from-mist-950 to-mist-900 p-5 shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-yellow-300/80">
            {moduleTitle}
          </p>
          <h2 className="text-2xl font-semibold text-yellow-50">{lesson.title}</h2>
        </div>
        <div className="flex flex-col items-end gap-1">
          <AchievementStars
            total={progress.total}
            completed={progress.completed}
            className="drop-shadow-sm"
          />
          <span className="text-[11px] uppercase tracking-[0.1em] text-amber-200/80">
            {progress.completed}/{progress.total} steps
          </span>
        </div>
      </div>

      <div className="mt-4 space-y-4 text-sm leading-relaxed">
        <div className="space-y-1.5">
          <p className="font-semibold text-yellow-100">Theory</p>
          <p className="text-yellow-100/80">{lesson.theory || '—'}</p>
        </div>
        <div className="space-y-1.5">
          <p className="font-semibold text-yellow-100">Task</p>
          <p className="whitespace-pre-wrap text-yellow-100/80">{lesson.task || '—'}</p>
        </div>
      </div>
    </section>
  );
}
