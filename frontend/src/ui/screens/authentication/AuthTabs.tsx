type AuthMode = 'login' | 'register';

type AuthTabsProps = {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
};

export function AuthTabs({ mode, onModeChange }: AuthTabsProps) {
  return (
    <div className="grid grid-cols-2 overflow-hidden rounded-t-2xl border-b border-slate-300">
      <button
        type="button"
        onClick={() => onModeChange('login')}
        className={`px-6 py-6 text-sm font-semibold tracking-wide transition-colors ${
          mode === 'login'
            ? 'bg-slate-100 text-slate-800'
            : 'bg-slate-300 text-slate-500 hover:bg-slate-200'
        }`}
      >
        Login
      </button>
      <button
        type="button"
        onClick={() => onModeChange('register')}
        className={`px-6 py-6 text-sm font-semibold tracking-wide transition-colors ${
          mode === 'register'
            ? 'bg-slate-100 text-slate-800'
            : 'bg-slate-300 text-slate-500 hover:bg-slate-200'
        }`}
      >
        Register
      </button>
    </div>
  );
}

