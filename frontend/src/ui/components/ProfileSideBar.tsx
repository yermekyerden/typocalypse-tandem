import { cn } from '@/lib/utils';
import { useI18n } from '@/i18n/useI18n';
import { type TabType } from '../screens/profile/ProfileScreen';

type ProfileSideBarProps = {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
};

type TabItem = {
  id: TabType;
  labelKey: 'profile.userData' | 'profile.progress';
};

const TABS: TabItem[] = [
  { id: 'user-data', labelKey: 'profile.userData' },
  { id: 'progress', labelKey: 'profile.progress' },
];

export function ProfileSideBar({ activeTab, setActiveTab }: ProfileSideBarProps) {
  const { t } = useI18n();
  return (
    <div className="rounded-2xl bg-[#2c2c2c] w-full lg:w-[25%] min-w-0 lg:min-w-43.75 max-w-none lg:max-w-67.5 flex lg:flex-col  gap-2 px-2 py-2">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => setActiveTab(tab.id)}
          className={cn(
            'flex flex-col text-left gap-2 rounded-lg bg-[#3f4044] p-4 focus-visible:ring-2 focus:outline-none focus-visible:ring-yellow-400',
            'md:flex-row md:items-center md:justify-between w-full cursor-pointer group',
          )}
        >
          <span
            className={cn(
              'text-sm uppercase tracking-wider text-white',
              activeTab === tab.id
                ? 'text-yellow-400'
                : 'text-white group-hover:text-yellow-400',
            )}
          >
            {t(tab.labelKey)}
          </span>
        </button>
      ))}
    </div>
  );
}
