import { getInitials } from '../screens/profile/utils';
import { User } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

type AvatarProps = {
  onClick?: () => void;
  className?: string;
};

export function Avatar({ onClick }: AvatarProps) {
  const user = useAuthStore((state) => state.user);

  const hasName = user?.firstName || user?.lastName;

  return (
    <button
      className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-700 text-lg font-semibold text-yellow-400 ring-2 ring-yellow-400/50 cursor-pointer focus:outline-none focus-visible:shadow-[0_0_0_3px_white]"
      onClick={onClick}
    >
      {hasName ? getInitials(user.firstName, user.lastName) : <User size={20} />}
    </button>
  );
}
