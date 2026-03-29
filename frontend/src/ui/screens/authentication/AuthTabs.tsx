import { cn } from '@/lib/utils';
import { useI18n } from '@/i18n/I18nProvider';

type AuthMode = 'login' | 'register';

type AuthTabsProps = {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
};

export function AuthTabs({ mode, onModeChange }: AuthTabsProps) {
  const { t } = useI18n();

  return (
    <div className="flex gap-2 p-1 bg-[#3f4044] rounded-lg">
      <button
        type="button"
        onClick={() => onModeChange('login')}
        className={cn(
          'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all cursor-pointer',
          mode === 'login'
            ? 'bg-yellow-400 text-gray-900 shadow-sm'
            : 'text-white/60 hover:text-white',
        )}
      >
        {t('auth.login')}
      </button>
      <button
        type="button"
        onClick={() => onModeChange('register')}
        className={cn(
          'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all cursor-pointer',
          mode === 'register'
            ? 'bg-yellow-400 text-gray-900 shadow-sm'
            : 'text-white/60 hover:text-white',
        )}
      >
        {t('auth.register')}
      </button>
    </div>
  );
}
