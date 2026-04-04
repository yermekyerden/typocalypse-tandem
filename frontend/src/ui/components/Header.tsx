import { Link } from 'react-router-dom';
import Logo from '@/assets/icons/LogoIcon.png';
import LogoLight from '@/assets/icons/LogoIconLight.png';
import { Avatar } from './Avatar';
import { useState, useEffect } from 'react';
import { ProfileModal } from './ui/ProfileModal';
import { useAuthStore } from '@/store/authStore';
import { useI18n } from '@/i18n/useI18n';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeToggle } from './ui/ThemeToggle';

export function Header() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDark, setIsDark] = useState(
    document.documentElement.classList.contains('dark'),
  );

  const user = useAuthStore((state) => state.user);
  const { t } = useI18n();

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div>
      <header className="bg-gradient-to-b from-mist-950 to-mist-800 text-yellow-400 min-h-16 flex items-center dark:bg-none dark:bg-mist-300">
        <div className="mx-auto flex items-center justify-between max-w-8xl px-4 w-full">
          <Link
            to="/"
            className="flex items-center gap-2 transition-all duration-300 hover:drop-shadow-[0_0_10px_rgba(250,204,21,0.9)] dark:hover:drop-shadow-none"
          >
            <img src={isDark ? LogoLight : Logo} alt="logo" className="h-8 w-8" />
            <span className="font-semibold text-yellow-400 text-lg dark:text-mist-900 dark:hover:text-indigo-900">
              {t('common.appName')}
            </span>
          </Link>

          <div className="flex items-center gap-4">
            {user && (
              <>
                <div className="flex gap-3 mr-4">
                  <Link
                    to="/"
                    className="text-yellow-50 transition hover:text-yellow-400 dark:text-mist-900 dark:hover:text-indigo-900"
                  >
                    {t('navigation.training')}
                  </Link>
                  <Link
                    to="/profile"
                    className="text-yellow-50 transition hover:text-yellow-400 dark:text-mist-900 dark:hover:text-indigo-900"
                  >
                    {t('navigation.profile')}
                  </Link>
                  <Link
                    to="/"
                    className="text-yellow-50 transition hover:text-yellow-400 dark:text-mist-900 dark:hover:text-indigo-900"
                  >
                    {t('navigation.settings')}
                  </Link>
                </div>
              </>
            )}

            <ThemeToggle />
            <LanguageSwitcher />
            <div>
              {user && (
                <div className="flex items-center gap-3 bg-mist-900 rounded-full dark:bg-mist-100">
                  {(user.firstName || user.lastName) && (
                    <span className="ml-4 text-2xl font-medium text-yellow-400 dark:text-mist-900">
                      {`${user.firstName || ''} ${user.lastName || ''}`.trim()}
                    </span>
                  )}

                  <Avatar onClick={() => setIsModalOpen(true)} />
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {isModalOpen && <ProfileModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
}
