type SendIconProps = {
  className?: string;
};

export function SendIcon({ className }: SendIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M12 19V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M7 11L12 6L17 11"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
