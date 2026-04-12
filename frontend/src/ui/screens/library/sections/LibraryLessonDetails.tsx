import { useId, useState } from 'react';

import { type LearningLessonView } from '@/features/learning/types';
import { useI18n } from '@/i18n/useI18n';
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
  const { t } = useI18n();
  const [areHintsVisible, setAreHintsVisible] = useState(false);
  const theoryTitleId = 'library-lesson-theory-title';
  const taskTitleId = 'library-lesson-task-title';
  const hintsTitleId = 'library-lesson-hints-title';
  const hintsContentId = useId();

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
            className="text-xl font-semibold text-yellow-50 sm:text-2xl dark:text-mist-900"
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
            className="text-[11px] uppercase tracking-[0.1em] text-amber-200/80 dark:text-mist-900/70"
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
          <h3
            id={theoryTitleId}
            className="font-semibold text-yellow-100 dark:text-mist-900"
          >
            {t('library.theory')}
          </h3>
          <p className="whitespace-pre-wrap text-yellow-100/80 dark:text-mist-900/85">
            {lesson.theoryMarkdown || t('common.notSet')}
          </p>
        </div>
        <div className="space-y-1.5" aria-labelledby={taskTitleId}>
          <h3
            id={taskTitleId}
            className="font-semibold text-yellow-100 dark:text-mist-900"
          >
            {t('library.task')}
          </h3>
          <p className="whitespace-pre-wrap text-yellow-100/80 dark:text-mist-900/85">
            {lesson.taskDescription || t('common.notSet')}
          </p>
        </div>
        {lesson.hints.length > 0 ? (
          <div className="space-y-1.5" aria-labelledby={hintsTitleId}>
            <h3
              id={hintsTitleId}
              className="font-semibold text-yellow-100 dark:text-mist-900"
            >
              {t('library.hints')}
            </h3>
            <div className="rounded-md border border-yellow-400/20 bg-white/5 dark:border-mist-400 dark:bg-mist-100">
              <button
                type="button"
                aria-expanded={areHintsVisible}
                aria-controls={hintsContentId}
                onClick={() => setAreHintsVisible((current) => !current)}
                className="w-full cursor-pointer px-3 py-2 text-left text-sm font-medium text-yellow-100 dark:text-mist-900"
              >
                {t('library.hints')}
              </button>
              {areHintsVisible ? (
                <ul
                  id={hintsContentId}
                  className="space-y-1 border-t border-yellow-400/15 px-3 py-3 text-yellow-100/80 dark:border-mist-400 dark:text-mist-900/85"
                >
                  {lesson.hints.map((hint) => (
                    <li key={hint}>{hint}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
