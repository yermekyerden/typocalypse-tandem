type AuthMode = 'login' | 'register';

type AuthSubmitButtonProps = {
  mode: AuthMode;
};

export function AuthSubmitButton({ mode }: AuthSubmitButtonProps) {
  return (
    <button
      type="submit"
      className="h-20 w-full rounded-xl bg-sky-700 text-xl font-semibold text-slate-100 transition hover:bg-sky-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
    >
      {mode === 'login' ? 'Log in' : 'Create account'}
    </button>
  );
}

