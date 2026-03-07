import { useEffect, useMemo, useState } from 'react';

type Props = {
  total: number;
  completed: number;
  size?: number;
  className?: string;
};

export function AchievementStars({ total, completed, size = 20, className = '' }: Props) {
  const [highlightIndex, setHighlightIndex] = useState<number | null>(null);

  useEffect(() => {
    if (completed <= 0) return;
    setHighlightIndex(completed - 1);
    const timer = setTimeout(() => setHighlightIndex(null), 450);
    return () => clearTimeout(timer);
  }, [completed]);

  const stars = useMemo(() => Array.from({ length: Math.max(total, 0) }), [total]);

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {stars.map((_, idx) => {
        const isFilled = idx < completed;
        const isNew = idx === highlightIndex;
        return (
          <svg
            key={idx}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            className={`transition-all duration-300 ${
              isFilled
                ? 'text-amber-300 drop-shadow-[0_0_10px_rgba(251,191,36,0.45)]'
                : 'text-slate-500/70'
            } ${isNew ? 'scale-110' : ''}`}
            fill={isFilled ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 2.5l2.9 5.88 6.5.94-4.7 4.58 1.1 6.45L12 17.9l-5.8 3.05 1.1-6.45-4.7-4.58 6.5-.94L12 2.5z" />
          </svg>
        );
      })}
    </div>
  );
}
