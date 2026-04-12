import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useI18n } from '@/i18n/useI18n';

type ProfileModalProps = {
  onClose: () => void;
};

export function ProfileModal({ onClose }: ProfileModalProps) {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const { t } = useI18n();

  const handleProfileClick = () => {
    navigate('/profile');
    onClose();
  };

  const handleLogoutClick = () => {
    logout();
    navigate('/auth');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 backdrop-blur-[2px]" onClick={onClose}>
      <div
        className="absolute right-10 top-[72px] bg-mist-900 dark:bg-mist-200 dark:text-mist-900 p-3 pl-4 pr-4 rounded-lg text-yellow-50 shadow-[0_0_10px_rgba(250,204,21,0.6)] dark:shadow-[0_0_10px_rgba(0,0,0,0.2)] flex flex-col gap-1"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="cursor-pointer hover:text-yellow-400 dark:hover:text-indigo-900"
          onClick={() => {
            navigate('/');
            onClose();
          }}
        >
          {t('navigation.training')}
        </button>
        <button
          className="cursor-pointer hover:text-yellow-400 dark:hover:text-indigo-900"
          onClick={handleProfileClick}
        >
          {t('navigation.profile')}
        </button>
        <button
          className="cursor-pointer hover:text-yellow-400 dark:hover:text-indigo-900"
          onClick={handleLogoutClick}
        >
          {t('navigation.logout')}
        </button>
      </div>
    </div>
  );
}
