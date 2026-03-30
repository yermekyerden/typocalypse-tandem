import type { LessonStatus } from '@/features/learning/types';
import type { TranslationKey } from '@/i18n/translations';

type Translate = (key: TranslationKey) => string;

export function getStatus(status: LessonStatus, t: Translate) {
  switch (status) {
    case 'completed':
      return (
        <span className="border px-2 py-0.5 text-[10px] uppercase tracking-wide bg-emerald-400/10 text-emerald-200 border-emerald-400/30">
          {t('library.status.completed')}
        </span>
      );
    case 'active':
      return (
        <span className="border px-2 py-0.5 text-[10px] uppercase tracking-wide bg-amber-400/10 text-amber-200 border-amber-400/30">
          {t('library.status.active')}
        </span>
      );
    default:
      return (
        <span className="border px-2 py-0.5 text-[10px] uppercase tracking-wide bg-slate-200/5 text-slate-200 border-slate-200/20">
          {t('library.status.pending')}
        </span>
      );
  }
}
