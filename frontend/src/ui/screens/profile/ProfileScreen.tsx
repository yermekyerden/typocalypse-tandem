import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { DashboardScreen } from '../dashboard/DashboardScreen';
import { cn } from '@/lib/utils';
import { useI18n } from '@/i18n/useI18n';
import { UserDataScreen } from '@/ui/components/UserDataScreen';

export type TabType = 'user-data' | 'progress';

export function ProfileScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('user-data');
  const { t } = useI18n();

  const fetchProfile = useAuthStore((s) => s.fetchProfile);

  const loadProfile = useCallback(async () => {
    try {
      await fetchProfile();
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
  }, [fetchProfile]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  return (
    <div className="px-4 py-6 bg-linear-to-b from-mist-950 to-mist-800 flex-1 dark:bg-none dark:bg-mist-200">
      <div className="mx-auto h-full flex gap-3">
        <div className="rounded-2xl bg-[#2c2c2c] h-full w-[25%] min-w-43.75 max-w-67.5 flex flex-col gap-2 px-2 py-2 dark:bg-mist-300">
          <button
            type="button"
            onClick={() => setActiveTab('user-data')}
            className={cn(
              'flex flex-col text-left gap-2 rounded-lg bg-[#3f4044] p-4 focus-visible:ring-2 focus:outline-none focus-visible:ring-yellow-400 dark:bg-mist-200',
              'md:flex-row md:items-center md:justify-between w-full cursor-pointer group',
            )}
          >
            <span
              className={cn(
                'text-sm uppercase tracking-wider text-white',
                activeTab === 'user-data'
                  ? 'text-yellow-400 dark:text-indigo-900'
                  : 'text-white group-hover:text-yellow-400 dark:text-mist-900 dark:group-hover:text-indigo-900',
              )}
            >
              {t('profile.userData')}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('progress')}
            className={cn(
              'flex flex-col text-left gap-2 rounded-lg bg-[#3f4044] p-4 focus-visible:ring-2 focus:outline-none focus-visible:ring-yellow-400 dark:bg-mist-200',
              'md:flex-row md:items-center md:justify-between w-full cursor-pointer group',
            )}
          >
            <span
              className={cn(
                'text-sm uppercase tracking-wider text-white dark:text-mist-900',
                activeTab === 'progress'
                  ? 'text-yellow-400 dark:text-indigo-900'
                  : 'text-white group-hover:text-yellow-400 dark:text-mist-900 dark:group-hover:text-indigo-900',
              )}
            >
              {t('profile.progress')}
            </span>
          </button>
        </div>

        <div className="rounded-2xl bg-[#2c2c2c] p-8 shadow-xl backdrop-blur-sm h-full w-full flex flex-col max-h-[80vh] overflow-y-auto md:justify-between dark;bg-none dark:bg-mist-300 scrollbar-thin">
          {activeTab === 'user-data' && <UserDataScreen />}
          {activeTab === 'progress' && <DashboardScreen></DashboardScreen>}
        </div>
      </div>
    </div>
  );
}
