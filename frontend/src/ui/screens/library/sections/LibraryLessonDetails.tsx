import { type LearningLessonView } from '@/features/learning/types';
import { AchievementStars } from '@/ui/components/AchievementStars';

type LibraryLessonDetailsProps = {
  lesson: LearningLessonView;
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
    <section
      aria-labelledby="library-lesson-title"
      className="flex max-h-[320px] min-h-[220px] shrink-0 flex-col overflow-auto border border-yellow-400/25 bg-gradient-to-b from-mist-950 to-mist-900 p-5 shadow-lg scrollbar-thin"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-yellow-300/80">
            {moduleTitle}
          </p>
          <h2 id="library-lesson-title" className="text-2xl font-semibold text-yellow-50">
            {lesson.title}
          </h2>
        </div>
        <div className="flex flex-col items-end gap-1">
          <AchievementStars
            total={progress.total}
            completed={progress.completed}
            className="drop-shadow-sm"
          />
          <span
            aria-live="polite"
            className="text-[11px] uppercase tracking-[0.1em] text-amber-200/80"
          >
            {progress.completed}/{progress.total} steps
          </span>
        </div>
      </div>

      <div className="mt-4 space-y-4 text-sm leading-relaxed">
        <div className="space-y-1.5">
          <p className="font-semibold text-yellow-100">Theory</p>
          <p className="whitespace-pre-wrap text-yellow-100/80">
            {lesson.theoryMarkdown || '—'}
          </p>
        </div>
        <div className="space-y-1.5">
          <p className="font-semibold text-yellow-100">Task</p>
          <p className="whitespace-pre-wrap text-yellow-100/80">
            {lesson.taskDescription || '—'}
          </p>
        </div>
        {lesson.hints.length > 0 ? (
          <div className="space-y-1.5">
            <p className="font-semibold text-yellow-100">Hints</p>
            <ul className="space-y-1 text-yellow-100/80">
              {lesson.hints.map((hint) => (
                <li key={hint}>{hint}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}
