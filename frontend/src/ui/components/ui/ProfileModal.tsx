import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

type ProfileModalProps = {
  onClose: () => void;
};

export function ProfileModal({ onClose }: ProfileModalProps) {
  const navigate = useNavigate();
  const { logout } = useAuthStore();

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
        className="absolute right-10 top-[72px] bg-mist-900 p-3 pl-4 pr-4 rounded-lg text-yellow-50 shadow-[0_0_10px_rgba(250,204,21,0.6)] flex flex-col gap-1"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="cursor-pointer hover:text-yellow-400">Training</button>
        <button
          className="cursor-pointer hover:text-yellow-400"
          onClick={handleProfileClick}
        >
          Profile
        </button>
        <button className="cursor-pointer hover:text-yellow-400">Settings</button>
        <button
          className="cursor-pointer hover:text-yellow-400"
          onClick={handleLogoutClick}
        >
          Logout
        </button>
      </div>
    </div>
  );
}
