import { type LearningLessonView } from '@/features/learning/types';
import { useI18n } from '@/i18n/useI18n';
import { AchievementStars } from '@/ui/components/AchievementStars';
import { AiAssistant } from '@/ui/components/AiAssistant';

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
  const { t } = useI18n();
  const theoryTitleId = 'library-lesson-theory-title';
  const taskTitleId = 'library-lesson-task-title';
  const hintsTitleId = 'library-lesson-hints-title';

  return (
    <section
      aria-labelledby="library-lesson-title"
      className="flex min-h-[220px] shrink-0 flex-col overflow-auto rounded-xl border border-yellow-400/25 bg-gradient-to-b from-mist-950 to-mist-900 p-4 shadow-lg scrollbar-thin max-lg:max-h-[240px] sm:p-5 lg:max-h-[320px] dark:bg-none dark:bg-mist-300 dark:border-mist-300"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-yellow-300/80 dark:text-mist-900">
            {moduleTitle}
          </p>
          <h2
            id="library-lesson-title"
            className="text-xl font-semibold text-yellow-50 sm:text-2xl"
          >
            {lesson.title}
          </h2>
        </div>
        <div className="flex flex-col gap-1 sm:items-end">
          <AchievementStars
            total={progress.total}
            completed={progress.completed}
            className="drop-shadow-sm"
          />
          <span
            aria-live="polite"
            className="text-[11px] uppercase tracking-[0.1em] text-amber-200/80"
          >
            {t('library.steps', {
              completed: progress.completed,
              total: progress.total,
            })}
          </span>
        </div>
      </div>

      <div className="mt-4 space-y-4 text-sm leading-relaxed">
        <div className="space-y-1.5" aria-labelledby={theoryTitleId}>
          <h3 id={theoryTitleId} className="font-semibold text-yellow-100">
            {t('library.theory')}
          </h3>
          <p className="whitespace-pre-wrap text-yellow-100/80">
            {lesson.theoryMarkdown || t('common.notSet')}
          </p>
        </div>
        <div className="space-y-1.5" aria-labelledby={taskTitleId}>
          <h3 id={taskTitleId} className="font-semibold text-yellow-100">
            {t('library.task')}
          </h3>
          <p className="whitespace-pre-wrap text-yellow-100/80">
            {lesson.taskDescription || t('common.notSet')}
          </p>
        </div>
        {lesson.hints.length > 0 ? (
          <div className="space-y-1.5" aria-labelledby={hintsTitleId}>
            <h3 id={hintsTitleId} className="font-semibold text-yellow-100">
              {t('library.hints')}
            </h3>
            <ul className="space-y-1 text-yellow-100/80">
              {lesson.hints.map((hint) => (
                <li key={hint}>{hint}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
      <AiAssistant />
    </section>
  );
}
