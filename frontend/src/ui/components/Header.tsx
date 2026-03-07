import { Link } from 'react-router-dom';
import Logo from '@/assets/icons/LogoIcon.png';
import { UserAvatar } from './Profile';

export function Header() {
  return (
    <div>
      <header className="border-b bg-gradient-to-b from-mist-950 to-mist-800 text-yellow-400 p-1">
        <div className="mx-auto flex items-center justify-between max-w-8xl px-4 py-1">
          <Link to="/" className="flex items-center gap-2">
            <img src={Logo} alt="Terminal Dojo" className="h-8 w-8" />
            <span className="font-semibold text-yellow-400 text-lg">Terminal Dojo</span>
          </Link>
          <UserAvatar></UserAvatar>
        </div>
      </header>
    </div>
  );
}
