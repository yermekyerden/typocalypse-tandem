import { Link } from 'react-router-dom';
import { useI18n } from '@/i18n/useI18n';

export function NotFoundScreen() {
  const { t } = useI18n();

  return (
    <div className="flex flex-col flex-1">
      <div className="bg-mist-800 text-yellow-400 p-5 m-5 rounded-2xl flex-1shadow-[inset_0_0_80px_rgba(10,10,10,0.6)]">
        <h1 className="text-8xl font-semibold">{'< 404 />'}</h1>
        <h2 className="uppercase mt-5 ml-5">{t('notFound.problem')}</h2>
        <h2 className="uppercase ml-5">{t('notFound.title')}</h2>
        <Link
          to="/"
          className="m-5 mt-10 inline-block text-gray-950 rounded-xl cursor-pointer bg-yellow-400 text-gray-950 px-5 py-3 shadow-lg transition-all duration-300 ease-in-out hover:bg-gray-900 hover:text-yellow-400 hover:shadow-[0_0_10px_rgba(250,204,21,0.2)]"
        >
          {t('notFound.goHome')}
        </Link>
      </div>
    </div>
  );
}
