import { useI18n } from '@/i18n/I18nProvider';
import { cn } from '@/lib/utils';

type LanguageSwitcherProps = {
  compact?: boolean;
};

export function LanguageSwitcher({ compact = false }: LanguageSwitcherProps) {
  const { language, setLanguage, t } = useI18n();

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-full border border-yellow-400/30 bg-mist-900/80 p-1 text-xs text-yellow-50',
        compact ? 'self-end' : '',
      )}
      aria-label={t('common.language')}
    >
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={cn(
          'rounded-full px-2.5 py-1 transition',
          language === 'en' ? 'bg-yellow-400 text-gray-950' : 'hover:bg-white/10',
        )}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLanguage('ru')}
        className={cn(
          'rounded-full px-2.5 py-1 transition',
          language === 'ru' ? 'bg-yellow-400 text-gray-950' : 'hover:bg-white/10',
        )}
      >
        RU
      </button>
      <button
        type="button"
        onClick={() => setLanguage('kk')}
        className={cn(
          'rounded-full px-2.5 py-1 transition',
          language === 'kk' ? 'bg-yellow-400 text-gray-950' : 'hover:bg-white/10',
        )}
      >
        KZ
      </button>
    </div>
  );
}
