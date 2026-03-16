import { type Module } from '@/mocks/modules';
import { AchievementStars } from '@/ui/components/AchievementStars';

type LibraryCompletionModalProps = {
  module: Module | null;
  onAcknowledge: () => void;
};

export function LibraryCompletionModal({
  module,
  onAcknowledge,
}: LibraryCompletionModalProps) {
  if (!module) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-sm border border-amber-400/70 bg-[radial-gradient(circle_at_20%_20%,rgba(250,204,21,0.08),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(34,197,94,0.06),transparent_40%),linear-gradient(145deg,#0e0f13,#0a0b10)] p-7 text-amber-50 shadow-[0_20px_60px_rgba(0,0,0,0.55)]">
        <div className="space-y-2 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-amber-200/80">
            Module completed
          </p>
          <h3 className="text-2xl font-semibold text-amber-50">
            Congratulations! {module.title} completed.
          </h3>
          <p className="text-sm leading-relaxed text-amber-100/80">
            Great work. You successfully completed every step in this module. Ready to
            move on?
          </p>
        </div>

        <div className="mt-4 flex justify-center">
          <AchievementStars
            total={module.lessons.length}
            completed={module.lessons.length}
            size={22}
            className="drop-shadow-[0_0_12px_rgba(251,191,36,0.45)]"
          />
        </div>

        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={onAcknowledge}
            className="inline-flex items-center gap-2 rounded-md border border-emerald-300/70 bg-gradient-to-r from-emerald-600 to-emerald-500 px-5 py-2.5 text-sm font-semibold text-emerald-50 shadow-[0_10px_40px_rgba(16,185,129,0.25)] transition hover:shadow-[0_12px_45px_rgba(16,185,129,0.35)]"
          >
            Continue learning
          </button>
        </div>
      </div>
    </div>
  );
}
