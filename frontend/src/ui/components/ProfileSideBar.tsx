import { cn } from '@/lib/utils';
import { useI18n } from '@/i18n/useI18n';
import { type TabType } from '../screens/profile/ProfileScreen';

type ProfileSideBarProps = {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
};

export function ProfileSideBar({ activeTab, setActiveTab }: ProfileSideBarProps) {
  const { t } = useI18n();
  return (
    <div className="rounded-2xl bg-[#2c2c2c] w-full lg:w-[25%] min-w-0 lg:min-w-43.75 max-w-none lg:max-w-67.5 flex lg:flex-col  gap-2 px-2 py-2">
      <button
        type="button"
        onClick={() => setActiveTab('user-data')}
        className={cn(
          'flex flex-col text-left gap-2 rounded-lg bg-[#3f4044] p-4 focus-visible:ring-2 focus:outline-none focus-visible:ring-yellow-400',
          'md:flex-row md:items-center md:justify-between w-full cursor-pointer group',
        )}
      >
        <span
          className={cn(
            'text-sm uppercase tracking-wider text-white',
            activeTab === 'user-data'
              ? 'text-yellow-400'
              : 'text-white group-hover:text-yellow-400',
          )}
        >
          {t('profile.userData')}
        </span>
      </button>

      <button
        type="button"
        onClick={() => setActiveTab('progress')}
        className={cn(
          'flex flex-col text-left gap-2 rounded-lg bg-[#3f4044] p-4 focus-visible:ring-2 focus:outline-none focus-visible:ring-yellow-400',
          'md:flex-row md:items-center md:justify-between w-full cursor-pointer group',
        )}
      >
        <span
          className={cn(
            'text-sm uppercase tracking-wider text-white',
            activeTab === 'progress'
              ? 'text-yellow-400'
              : 'text-white group-hover:text-yellow-400',
          )}
        >
          {t('profile.progress')}
        </span>
      </button>
    </div>
  );
}
