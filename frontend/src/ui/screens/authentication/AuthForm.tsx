import type { AuthFormValues } from './AuthScreen';
import { useI18n } from '@/i18n/useI18n';

interface AuthFormProps {
  values: AuthFormValues;
  onChange: (field: keyof AuthFormValues, value: string) => void;
  disabled?: boolean;
  mode: 'login' | 'register';
}

export function AuthForm({ values, onChange, disabled, mode }: AuthFormProps) {
  const { t } = useI18n();

  return (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="username"
          className="block text-sm font-medium text-white/60 mb-1 dark:text-mist-900"
        >
          {t('auth.username')}
        </label>
        <input
          type="text"
          id="username"
          placeholder={t('auth.usernamePlaceholder')}
          value={values.username}
          onChange={(e) => onChange('username', e.target.value)}
          disabled={disabled}
          className="w-full rounded-lg bg-[#3f4044] border border-transparent px-4 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed dark:bg-mist-200 dark:text-mist-900 dark:focus:ring-indigo-300 dark:placeholder:text-mist-900/40"
          required
        />
      </div>

      {mode === 'register' && (
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-white/60 mb-1 dark:text-mist-900"
          >
            {t('auth.email')}
          </label>
          <input
            type="email"
            id="email"
            placeholder={t('auth.emailPlaceholder')}
            value={values.email || ''}
            onChange={(e) => onChange('email', e.target.value)}
            disabled={disabled}
            className="w-full rounded-lg bg-[#3f4044] border border-transparent px-4 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed dark:bg-mist-200 dark:text-mist-900 dark:focus:ring-indigo-300 dark:placeholder:text-mist-900/40"
            required
          />
        </div>
      )}

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-white/60 mb-1 dark:text-mist-900"
        >
          {t('auth.password')}
        </label>
        <input
          type="password"
          id="password"
          placeholder={t('auth.passwordPlaceholder')}
          value={values.password}
          onChange={(e) => onChange('password', e.target.value)}
          disabled={disabled}
          className="w-full rounded-lg bg-[#3f4044] border border-transparent px-4 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed dark:bg-mist-200 dark:text-mist-900 dark:focus:ring-indigo-300 dark:placeholder:text-mist-900/40"
          required
        />
      </div>
    </div>
  );
}
