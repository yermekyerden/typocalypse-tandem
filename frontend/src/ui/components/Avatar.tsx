import { getInitials } from '../screens/profile/utils';

type AvatarProps = {
  onClick: () => void;
};

export function Avatar({ onClick }: AvatarProps) {
  return (
    <div
      className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-700 text-lg
      font-semibold text-yellow-400 ring-2 ring-yellow-400/50 cursor-pointer"
      onClick={onClick}
    >
      {getInitials()}
    </div>
  );
}
