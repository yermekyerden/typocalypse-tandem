import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { DashboardScreen } from '../dashboard/DashboardScreen';
import { ProfileSideBar } from '@/ui/components/ProfileSideBar';
import { UserDataScreen } from '@/ui/components/UserDataScreen';

export type TabType = 'user-data' | 'progress';

export function ProfileScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('user-data');

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
    <div className="px-4 py-6 bg-linear-to-b from-mist-950 to-mist-800 flex-1  h-full">
      <div className="mx-auto flex flex-col lg:flex-row gap-3 h-full items-stretch">
        <ProfileSideBar activeTab={activeTab} setActiveTab={setActiveTab} />

        <div className="rounded-2xl bg-[#2c2c2c] p-8 shadow-xl backdrop-blur-sm w-full flex flex-col overflow-y-auto">
          {activeTab === 'user-data' && <UserDataScreen></UserDataScreen>}
          {activeTab === 'progress' && <DashboardScreen></DashboardScreen>}
        </div>
      </div>
    </div>
  );
}
