import { getInitials } from '../screens/profile/utils';
import { User } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

type AvatarProps = {
  onClick: () => void;
};

export function Avatar({ onClick }: AvatarProps) {
  const user = useAuthStore((state) => state.user);

  const hasName = user?.firstName || user?.lastName;

  return (
    <div
      className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-700 text-lg font-semibold text-yellow-400 ring-2 ring-yellow-400/50 cursor-pointer"
      onClick={onClick}
    >
      {hasName ? getInitials(user.firstName, user.lastName) : <User size={20} />}
    </div>
  );
}
