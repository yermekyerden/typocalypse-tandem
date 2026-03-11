import { cn } from '@/lib/utils';
import { useState } from 'react';
import { userData } from '@/mocks/user-data';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { ChangeData } from '../../components/EditProfileDialog';
import { getInitials } from './utils';

type TabType = 'user-data' | 'progress' | 'settings';

export function ProfilePage() {
  const [activeTab, setActiveTab] = useState<TabType>('user-data');

  return (
    <div className="px-4 py-6 bg-linear-to-b from-mist-950 to-mist-800 flex-1">
      <div className="mx-auto h-full flex gap-3">
        <div className="rounded-2xl bg-[#2c2c2c] h-full w-[25%] min-w-43.75 max-w-67.5 flex flex-col gap-2 px-2 py-2">
          <div
            onClick={() => setActiveTab('user-data')}
            className={cn(
              'flex flex-col gap-2 rounded-lg bg-[#3f4044] p-4',
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
              User data
            </span>
          </div>

          <div
            onClick={() => setActiveTab('progress')}
            className={cn(
              'flex flex-col gap-2 rounded-lg bg-[#3f4044] p-4',
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
              Progress
            </span>
          </div>

          <div
            onClick={() => setActiveTab('settings')}
            className={cn(
              'flex flex-col gap-2 rounded-lg bg-[#3f4044] p-4',
              'md:flex-row md:items-center md:justify-between w-full cursor-pointer group',
            )}
          >
            <span
              className={cn(
                'text-sm uppercase tracking-wider text-white',
                activeTab === 'settings'
                  ? 'text-yellow-400'
                  : 'text-white group-hover:text-yellow-400',
              )}
            >
              Settings
            </span>
          </div>
        </div>

        <div className="rounded-2xl bg-[#2c2c2c] p-8 shadow-xl backdrop-blur-sm h-full w-full flex flex-col md:justify-between">
          {activeTab === 'user-data' && (
            <>
              <h1 className="mb-8 text-4xl font-bold text-yellow-400">
                {userData.userName}
              </h1>

              <div className="flex mb-8">
                <Avatar className="h-24 w-24 ring-4 ring-yellow-400/50">
                  <AvatarFallback className="bg-[#2c2c2c] text-yellow-400 text-4xl">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="space-y-6">
                <div
                  className={cn(
                    'flex gap-2 rounded-lg bg-[#3f4044] p-4',
                    'md:flex-row md:items-center md:justify-between w-[50%]',
                  )}
                >
                  <span className="text-sm uppercase tracking-wider text-white">
                    Username
                  </span>
                  <span className="text-lg text-yellow-400">{userData.userName}</span>
                </div>

                <div
                  className={cn(
                    'flex flex-col gap-2 rounded-lg bg-[#3f4044] p-4',
                    'md:flex-row md:items-center md:justify-between max-w-[50%]',
                  )}
                >
                  <span className="text-sm uppercase tracking-wider text-white">
                    Login
                  </span>
                  <span className="text-lg text-yellow-400">{userData.login}</span>
                </div>

                <div
                  className={cn(
                    'flex flex-col gap-2 rounded-lg bg-[#3f4044] p-4',
                    'md:flex-row md:items-center md:justify-between max-w-[50%]',
                  )}
                >
                  <span className="text-sm uppercase tracking-wider text-white">
                    Email
                  </span>
                  <span className="text-lg text-yellow-400">{userData.email}</span>
                </div>

                <div
                  className={cn(
                    'flex flex-col gap-2 rounded-lg bg-[#3f4044] p-4',
                    'md:flex-row md:items-center md:justify-between max-w-[50%]',
                  )}
                >
                  <span className="text-sm uppercase tracking-wider text-white">
                    Password
                  </span>
                  <span className="text-lg text-yellow-400">********</span>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <ChangeData></ChangeData>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
