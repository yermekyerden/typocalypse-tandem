type StopIconProps = {
  className?: string;
};

export function StopIcon({ className }: StopIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <rect x="7" y="7" width="10" height="10" rx="2" />
    </svg>
  );
}
