import { TerminalWindow } from '@/ui/components/TerminalWindow';
import { useI18n } from '@/i18n/I18nProvider';

export function LibraryTerminalSection() {
  const { t } = useI18n();

  return (
    <section className="flex flex-1 min-h-0 flex-col overflow-hidden border border-yellow-400/25 bg-gradient-to-b from-mist-950 to-mist-900 p-5 shadow-lg">
      <div className="space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-yellow-300/80">
          {t('library.terminal')}
        </p>
        <h2 className="text-2xl font-semibold text-yellow-50">
          {t('library.sandboxTitle')}
        </h2>
        <p className="text-sm text-yellow-100/80">{t('library.sandboxDescription')}</p>
      </div>

      <div className="mt-4 flex min-h-0 flex-1 overflow-hidden">
        <TerminalWindow className="h-full min-h-0 flex-1" />
      </div>
    </section>
  );
}
