import { TerminalWindow } from '@/ui/components/TerminalWindow';

export function LibraryTerminalSection() {
  return (
    <section className="flex flex-1 min-h-0 flex-col overflow-hidden border border-yellow-400/25 bg-gradient-to-b from-mist-950 to-mist-900 p-5 shadow-lg">
      <div className="space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-yellow-300/80">
          Terminal
        </p>
        <h2 className="text-2xl font-semibold text-yellow-50">
          Sandbox for completing tasks
        </h2>
        <p className="text-sm text-yellow-100/80">
          Enter commands, progress is synchronized with modules.
        </p>
      </div>

      <div className="mt-4 flex min-h-0 flex-1 overflow-hidden">
        <TerminalWindow className="h-full min-h-0 flex-1" />
      </div>
    </section>
  );
}
