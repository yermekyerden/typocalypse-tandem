const statuses = {
  completed: (
    <span className="border px-2 py-0.5 text-[10px] uppercase tracking-wide bg-emerald-400/10 text-emerald-200 border-emerald-400/30">
      completed
    </span>
  ),
  pending: (
    <span className="border px-2 py-0.5 text-[10px] uppercase tracking-wide bg-slate-200/5 text-slate-200 border-slate-200/20">
      pending
    </span>
  ),
  active: (
    <span className="border px-2 py-0.5 text-[10px] uppercase tracking-wide bg-amber-400/10 text-amber-200 border-amber-400/30">
      active
    </span>
  ),
};

export function getStatus(index: number) {
  let result;
  switch (index) {
    case 0:
      result = statuses.completed;
      break;
    case 1:
      result = statuses.active;
      break;
    default:
      result = statuses.pending;
  }
  return result;
}
