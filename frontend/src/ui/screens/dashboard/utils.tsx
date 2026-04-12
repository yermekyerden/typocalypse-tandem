import type { LessonStatus } from '@/features/learning/types';
import type { TranslationKey } from '@/i18n/translations';

type Translate = (key: TranslationKey) => string;

export function getStatus(status: LessonStatus, t: Translate) {
  switch (status) {
    case 'completed':
      return (
        <span className="border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-emerald-200 dark:border-emerald-500/30 dark:bg-emerald-500/12 dark:text-emerald-700">
          {t('library.status.completed')}
        </span>
      );
    case 'active':
      return (
        <span className="border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-amber-200 dark:border-amber-500/30 dark:bg-amber-500/12 dark:text-amber-700">
          {t('library.status.active')}
        </span>
      );
    default:
      return (
        <span className="border border-slate-200/20 bg-slate-200/5 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-200 dark:border-slate-400/35 dark:bg-slate-400/10 dark:text-slate-600">
          {t('library.status.pending')}
        </span>
      );
  }
}
