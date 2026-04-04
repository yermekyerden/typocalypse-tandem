import { useI18n } from '@/i18n/useI18n';
import { cn } from '@/lib/utils';

type LanguageSwitcherProps = {
  compact?: boolean;
};

export function LanguageSwitcher({ compact = false }: LanguageSwitcherProps) {
  const { language, setLanguage, t } = useI18n();
  const activeBtn = 'bg-yellow-400 text-gray-950 dark:text-mist-900 dark:bg-indigo-300';
  const inactiveBtn = 'hover:bg-white/10 dark:hover:bg-mist-300 dark:text-mist-900';

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-full border border-yellow-400/30 bg-mist-900/80 p-1 text-xs text-yellow-50 dark:bg-mist-200 dark:border-none',
        compact ? 'self-end' : '',
      )}
      aria-label={t('common.language')}
    >
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={cn(
          'rounded-full px-2.5 py-1 transition',
          language === 'en' ? activeBtn : inactiveBtn,
        )}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLanguage('ru')}
        className={cn(
          'rounded-full px-2.5 py-1 transition',
          language === 'ru' ? activeBtn : inactiveBtn,
        )}
      >
        RU
      </button>
      <button
        type="button"
        onClick={() => setLanguage('kk')}
        className={cn(
          'rounded-full px-2.5 py-1 transition',
          language === 'kk' ? activeBtn : inactiveBtn,
        )}
      >
        KZ
      </button>
    </div>
  );
}
