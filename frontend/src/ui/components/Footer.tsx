import GitHubLogo from '@/assets/icons/GitHub.png';
import { useI18n } from '@/i18n/useI18n';

export function Footer() {
  const { t } = useI18n();

  return (
    <footer className="bg-gradient-to-b from-mist-950 to-mist-800 text-yellow-50 p-3 dark:bg-none dark:bg-mist-300">
      <div className="mx-auto flex items-center justify-between max-w-8xl px-4">
        <p className="text-sm">&copy; 2026 {t('common.appName')}</p>

        <a
          href="https://rs.school/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm hover:text-yellow-400 dark:text-mist-900 dark:hover:text-indigo-900"
        >
          {t('footer.school')}
        </a>

        <a
          href="https://github.com/yermekyerden/typocalypse-tandem"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm hover:text-yellow-400"
          aria-label={t('navigation.githubRepository')}
        >
          <img src={GitHubLogo} alt="" className="h-6 w-6" />
        </a>
      </div>
    </footer>
  );
}
