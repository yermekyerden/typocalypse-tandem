import { userData } from '@/mocks/user-data';

export function getInitials() {
  const userName = userData.userName
    .split(' ')
    .map((elem) => elem[0])
    .join('')
    .toUpperCase();
  return userName;
}
