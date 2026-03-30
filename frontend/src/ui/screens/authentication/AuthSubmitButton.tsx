import { cn } from '@/lib/utils';
import { useI18n } from '@/i18n/useI18n';

interface AuthSubmitButtonProps {
  mode: 'login' | 'register';
  isLoading?: boolean;
  disabled?: boolean;
}

export function AuthSubmitButton({ mode, isLoading, disabled }: AuthSubmitButtonProps) {
  const { t } = useI18n();

  const buttonText = {
    login: isLoading ? t('auth.signingIn') : t('auth.login'),
    register: isLoading ? t('auth.creatingAccount') : t('auth.createAccountButton'),
  };

  return (
    <button
      type="submit"
      disabled={disabled || isLoading}
      className={cn(
        'w-full py-2.5 px-4 rounded-lg font-medium transition-all',
        'bg-yellow-400 text-gray-900 hover:bg-yellow-500',
        'focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-[#2c2c2c]',
        'disabled:opacity-50 disabled:cursor-not-allowed',
      )}
    >
      {buttonText[mode]}
    </button>
  );
}
