import { Link } from 'react-router-dom';
import Logo from '@/assets/icons/LogoIcon.png';
import { Avatar } from './Avatar';
import { useState } from 'react';
import { ProfileModal } from './ui/ProfileModal';
import { useAuthStore } from '@/store/authStore';

export function Header() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const user = useAuthStore((state) => state.user);

  return (
    <div>
      <header className="bg-gradient-to-b from-mist-950 to-mist-800 text-yellow-400 min-h-16 flex items-center">
        <div className="mx-auto flex items-center justify-between max-w-8xl px-4 w-full">
          <Link
            to="/"
            className="flex items-center gap-2 transition hover:drop-shadow-[0_0_10px_rgba(250,204,21,0.9)]"
          >
            <img src={Logo} alt="" className="h-8 w-8" />
            <span className="font-semibold text-yellow-400 text-lg">Terminal Dojo</span>
          </Link>

          {user && (
            <div className="flex items-center gap-4">
              <div className="flex gap-3 mr-4">
                <Link to="/" className="text-yellow-50 transition hover:text-yellow-400">
                  Training
                </Link>
                <Link
                  to="/profile"
                  className="text-yellow-50 transition hover:text-yellow-400"
                >
                  Profile
                </Link>
                <Link to="/" className="text-yellow-50 transition hover:text-yellow-400">
                  Settings
                </Link>
              </div>

              <button
                onClick={() => setIsModalOpen(true)}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-700 text-lg font-semibold text-yellow-400 ring-2 ring-yellow-400/50 transition hover:shadow-[0_0_15px_rgba(250,204,21,0.8)] focus:outline-none focus:ring-2 focus:ring-yellow-400/70"
                aria-label="Open profile menu"
              >
                <Avatar />
              </button>
            </div>
          )}
        </div>
      </header>

      {isModalOpen && <ProfileModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
}
