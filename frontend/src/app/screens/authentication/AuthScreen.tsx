import { useState } from 'react';

import { AuthForm } from './AuthForm';
import { AuthSubmitButton } from './AuthSubmitButton';
import { AuthTabs } from './AuthTabs';

type AuthMode = 'login' | 'register';

type AuthFormValues = {
  email: string;
  password: string;
};

const initialValues: AuthFormValues = {
  email: '',
  password: '',
};

export function AuthScreen() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [values, setValues] = useState<AuthFormValues>(initialValues);

  const handleFormChange = (field: keyof AuthFormValues, value: string) => {
    setValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));
  };

  const handleModeChange = (nextMode: AuthMode) => {
    setMode(nextMode);
    setValues(initialValues);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <div className="relative min-h-dvh overflow-hidden bg-slate-700 px-4 py-8 sm:px-6">
      <div className="pointer-events-none absolute inset-x-[-10%] bottom-[-7rem] h-64 rotate-2 bg-slate-200/65" />
      <div className="pointer-events-none absolute inset-x-[-8%] bottom-[-8.5rem] h-60 -rotate-6 bg-slate-300/60" />
      <div className="pointer-events-none absolute inset-x-[-6%] bottom-[-6.5rem] h-56 rotate-6 bg-slate-500/30" />

      <div className="relative mx-auto w-full max-w-4xl rounded-2xl border border-slate-300 bg-slate-100 shadow-2xl">
        <AuthTabs mode={mode} onModeChange={handleModeChange} />

        <form onSubmit={handleSubmit} className="space-y-9 px-6 py-10 sm:px-10 sm:py-12">
          <AuthForm values={values} onChange={handleFormChange} />
          <AuthSubmitButton mode={mode} />
        </form>
      </div>
    </div>
  );
}

