import { useEffect, useState } from 'react';
import { SunIcon } from '@/components/ui/sun_icon';
import { MoonIcon } from '@/components/ui/moon_icon';

type Theme = 'light' | 'dark';

function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.theme as Theme) || 'light';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.theme = theme;
  }, [theme]);

  const handleClick = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <button
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className="cursor-pointer text-yellow-50 transition hover:text-yellow-400 dark:text-mist-900 dark:hover:text-indigo-900"
      onClick={handleClick}
    >
      {theme === 'dark' ? <MoonIcon /> : <SunIcon />}
    </button>
  );
}

export { ThemeToggle };
