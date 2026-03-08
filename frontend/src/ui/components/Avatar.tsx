import { getInitials } from '../screens/profile/utils';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

export function UserAvatar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = () => {
    if (location.pathname !== '/profile') {
      navigate('/profile');
    }
  };

  return (
    <div
      className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-700 text-lg
      font-semibold text-yellow-400 ring-2 ring-yellow-400/50 cursor-pointer"
      onClick={handleClick}
    >
      {getInitials()}
    </div>
  );
}
