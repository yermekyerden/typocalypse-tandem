import { cn } from '@/lib/utils';
import { userData } from '@/mocks/user-data';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User } from 'lucide-react';

function getInitials() {
  const userName = userData.userName
    .split(' ')
    .map((elem) => elem[0])
    .join('')
    .toUpperCase();
  return userName;
}

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

export function ProfilePage() {
  return (
    <div className="px-4 py-6 bg-linear-to-b from-mist-950 to-mist-800 flex-1">
      <div className="mx-auto h-full">
        <div className="rounded-2xl bg-[#2c2c2c] p-8 shadow-xl backdrop-blur-sm h-full flex flex-col md:justify-between">
          <h1 className="mb-8 text-4xl font-bold text-yellow-400">{userData.userName}</h1>

          <div className="flex mb-8">
            <Avatar className="h-24 w-24 ring-4 ring-yellow-400/50">
              <AvatarFallback className="bg-[#2c2c2c] text-yellow-400">
                <User className="h-12 w-12 stroke-yellow-400" />
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="space-y-6">
            <div className="flex flex-col gap-2 rounded-lg bg-gray-700/50 p-4 md:flex-row md:items-center md:justify-between max-w-[50%]">
              <span className="text-sm uppercase tracking-wider text-gray-400">
                Username
              </span>
              <span className="text-lg text-yellow-400">{userData.userName}</span>
            </div>

            <div className="flex flex-col gap-2 rounded-lg bg-gray-700/50 p-4 md:flex-row md:items-center md:justify-between max-w-[50%]">
              <span className="text-sm uppercase tracking-wider text-gray-400">
                Login
              </span>
              <span className="text-lg text-yellow-400">{userData.login}</span>
            </div>

            <div className="flex flex-col gap-2 rounded-lg bg-gray-700/50 p-4 md:flex-row md:items-center md:justify-between max-w-[50%]">
              <span className="text-sm uppercase tracking-wider text-gray-400">
                Email
              </span>
              <span className="text-lg text-yellow-400">{userData.email}</span>
            </div>

            <div className="flex flex-col gap-2 rounded-lg bg-gray-700/50 p-4 md:flex-row md:items-center md:justify-between max-w-[50%]">
              <span className="text-sm uppercase tracking-wider text-gray-400">
                Password
              </span>
              <span className="text-lg text-yellow-400">********</span>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              className={cn(
                'px-6 py-3 font-medium transition-all duration-200 rounded-[30px]',
                'bg-[#ffd101] text-gray-900',
                'hover:bg-yellow-300 hover:shadow-lg hover:shadow-yellow-400/20',
                'active:scale-95 cursor-pointer',
              )}
            >
              Change data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
