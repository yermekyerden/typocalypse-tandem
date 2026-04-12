import { TerminalWindow } from '@/ui/screens/library/sections/TerminalWindow';
import { useI18n } from '@/i18n/useI18n';

export function LibraryTerminalSection() {
  const { t } = useI18n();

  return (
    <section
      aria-labelledby="library-terminal-title"
      className="flex min-h-[360px] flex-col overflow-hidden rounded-xl border border-yellow-400/25 bg-gradient-to-b from-mist-950 to-mist-900 p-4 shadow-lg sm:min-h-[420px] sm:p-5 lg:min-h-0 lg:flex-1 dark:bg-none dark:bg-mist-300 dark:border-mist-300"
    >
      <div className="space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-yellow-300/80 dark:text-mist-900">
          {t('library.terminal')}
        </p>
        <h2
          id="library-terminal-title"
          className="text-2xl font-semibold text-yellow-50 dark:text-mist-900"
        >
          {t('library.sandboxTitle')}
        </h2>
        <p className="text-sm text-yellow-100/80 dark:text-mist-900">
          {t('library.sandboxDescription')}
        </p>
      </div>

      <div className="mt-4 flex min-h-0 flex-1 overflow-hidden">
        <TerminalWindow className="h-full min-h-0 flex-1" />
      </div>
    </section>
  );
}
