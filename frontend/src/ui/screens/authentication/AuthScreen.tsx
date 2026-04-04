import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useI18n } from '@/i18n/useI18n';
import { AuthForm } from './AuthForm';
import { AuthSubmitButton } from './AuthSubmitButton';
import { AuthTabs } from './AuthTabs';

type AuthMode = 'login' | 'register';

export type AuthFormValues = {
  username: string;
  email?: string;
  password: string;
};

const initialValues: AuthFormValues = {
  username: '',
  email: '',
  password: '',
};

export function AuthScreen() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>('login');
  const [values, setValues] = useState<AuthFormValues>(initialValues);
  const { t } = useI18n();

  const login = useAuthStore((state) => state.login);
  const register = useAuthStore((state) => state.register);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);
  const accessToken = useAuthStore((state) => state.accessToken);

  useEffect(() => {
    if (accessToken) {
      navigate('/profile', { replace: true });
    }
  }, [accessToken, navigate]);

  const handleFormChange = (field: keyof AuthFormValues, value: string) => {
    setValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));
  };

  const handleModeChange = (nextMode: AuthMode) => {
    setMode(nextMode);
    clearError();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      clearError();
      if (mode === 'login') {
        await login(values.username, values.password);
      } else {
        if (!values.email) {
          return;
        }
        await register(values.username, values.email, values.password);
      }
    } catch (error) {
      console.error('Auth error:', error);
    }
  };

  return (
    <>
      <div className="px-4 py-6 bg-linear-to-b from-mist-950 to-mist-800 flex-1 overflow-auto">
        <div className="mx-auto h-full flex items-center justify-center">
          <div className="rounded-2xl bg-[#2c2c2c] p-8 shadow-xl backdrop-blur-sm w-full max-w-md">
            <div className="mb-8 text-center">
              <h1 className="text-4xl font-bold text-yellow-400">
                {t('common.appName')}
              </h1>
              <p className="text-white/60 mt-2">
                {mode === 'login' ? t('auth.welcomeBack') : t('auth.createAccount')}
              </p>
            </div>

            <div className="mb-6">
              <AuthTabs mode={mode} onModeChange={handleModeChange} />
            </div>
            {error && (
              <div className="rounded-md bg-red-500/20 p-3 text-sm text-red-400">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <AuthForm
                values={values}
                onChange={handleFormChange}
                disabled={isLoading}
                mode={mode}
              />

              <AuthSubmitButton mode={mode} isLoading={isLoading} disabled={isLoading} />
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
