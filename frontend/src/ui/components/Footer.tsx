import GitHubLogo from '@/assets/icons/GitHub.png';
import { useI18n } from '@/i18n/useI18n';

export function Footer() {
  const { t } = useI18n();

  return (
    <footer className="dark:bg-mist-300 bg-linear-to-b from-mist-950 to-mist-800 dark:bg-none p-3 text-yellow-50">
      <div className="flex justify-between items-center mx-auto px-4 max-w-8xl">
        <p className="dark:text-mist-900 text-sm">&copy; 2026 {t('common.appName')}</p>

        <a
          href="https://rs.school/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-yellow-400 dark:hover:text-indigo-900 dark:text-mist-900 text-sm"
        >
          {t('footer.school')}
        </a>

        <a
          href="https://github.com/house-of-typocalypse/typocalypse-tandem"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 hover:text-yellow-400 text-sm"
          aria-label={t('navigation.githubRepository')}
        >
          <img
            src={GitHubLogo}
            alt=""
            className="dark:drop-shadow-[0_0_10px_rgba(99,102,241,0.9)] w-6 h-6"
          />
        </a>
      </div>
    </footer>
  );
}
