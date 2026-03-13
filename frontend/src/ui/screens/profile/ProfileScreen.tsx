import { cn } from '@/lib/utils';
import { useState } from 'react';
import { userData } from '@/mocks/user-data';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { getInitials } from './utils';

type TabType = 'user-data' | 'progress' | 'settings';
type EditableField = 'username' | 'login' | 'email' | 'password' | null;

export function ProfileScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('user-data');
  const [editingField, setEditingField] = useState<EditableField>(null);
  const [editValue, setEditValue] = useState('');

  function handleEditClick(field: EditableField, currentValue: string) {
    if (!field) return;
    setEditingField(field);
    setEditValue(currentValue);
  }

  function handleCancel() {
    setEditingField(null);
    setEditValue('');
  }

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
                    'flex flex-col gap-4 rounded-lg p-4 border-b',
                    'md:flex-row md:items-center max-w-150 w-full',
                  )}
                >
                  <span className="text-sm uppercase tracking-wider text-white flex-1">
                    Username
                  </span>
                  {editingField === 'username' ? (
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="text-lg bg-[#4f5054] text-yellow-400 ml-auto px-2 py-1 rounded-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      autoFocus
                    />
                  ) : (
                    <span className="text-lg text-yellow-400 ml-auto">
                      {userData.userName}
                    </span>
                  )}

                  {editingField === 'username' ? (
                    <button
                      className="flex justify-center items-center cursor-pointer gap-1 px-2 py-1.5 rounded-sm bg-[#3f4044] w-fit"
                      onClick={handleCancel}
                    >
                      <span>Save</span>
                    </button>
                  ) : (
                    <button
                      className="flex justify-center items-center cursor-pointer gap-1 px-2 py-1.5 rounded-sm bg-[#3f4044] w-fit"
                      onClick={() => handleEditClick('username', userData.userName)}
                    >
                      <span>Edit</span>
                      <img className="w-4 h-4" src="/typocalypse-tandem/Union.svg"></img>
                    </button>
                  )}
                </div>

                <div
                  className={cn(
                    'flex flex-col gap-2 rounded-lg p-4 border-b',
                    'md:flex-row md:items-center max-w-150 w-full',
                  )}
                >
                  <span className="text-sm uppercase tracking-wider text-white flex-1">
                    Login
                  </span>
                  {editingField === 'login' ? (
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="text-lg bg-[#4f5054] text-yellow-400 ml-auto px-2 py-1 rounded-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      autoFocus
                    />
                  ) : (
                    <span className="text-lg text-yellow-400 ml-auto">
                      {userData.login}
                    </span>
                  )}
                  {editingField === 'login' ? (
                    <button
                      className="flex justify-center items-center cursor-pointer gap-1 px-2 py-1.5 rounded-sm bg-[#3f4044] w-fit"
                      onClick={handleCancel}
                    >
                      <span>Save</span>
                    </button>
                  ) : (
                    <button
                      className="flex justify-center items-center cursor-pointer gap-1 px-2 py-1.5 rounded-sm bg-[#3f4044] w-fit"
                      onClick={() => handleEditClick('login', userData.login)}
                    >
                      <span>Edit</span>
                      <img className="w-4 h-4" src="/typocalypse-tandem/Union.svg"></img>
                    </button>
                  )}
                </div>

                <div
                  className={cn(
                    'flex flex-col gap-4 rounded-lg p-4 border-b',
                    'md:flex-row md:items-center max-w-150 w-full',
                  )}
                >
                  <span className="text-sm uppercase tracking-wider text-white flex-1">
                    Email
                  </span>
                  {editingField === 'email' ? (
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="text-lg bg-[#4f5054] text-yellow-400 ml-auto px-2 py-1 rounded-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      autoFocus
                    />
                  ) : (
                    <span className="text-lg text-yellow-400 ml-auto">
                      {userData.email}
                    </span>
                  )}
                  {editingField === 'email' ? (
                    <button
                      className="flex justify-center items-center cursor-pointer gap-1 px-2 py-1.5 rounded-sm bg-[#3f4044] w-fit"
                      onClick={handleCancel}
                    >
                      <span>Save</span>
                    </button>
                  ) : (
                    <button
                      className="flex justify-center items-center cursor-pointer gap-1 px-2 py-1.5 rounded-sm bg-[#3f4044] w-fit"
                      onClick={() => handleEditClick('email', userData.email)}
                    >
                      <span>Edit</span>
                      <img className="w-4 h-4" src="/typocalypse-tandem/Union.svg"></img>
                    </button>
                  )}
                </div>

                <div
                  className={cn(
                    'flex flex-col gap-4 rounded-lg p-4 border-b',
                    'md:flex-row md:items-center max-w-150 w-full',
                  )}
                >
                  <span className="text-sm uppercase tracking-wider text-white flex-1">
                    Password
                  </span>
                  {editingField === 'password' ? (
                    <input
                      type="password"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="text-lg bg-[#4f5054] text-yellow-400 ml-auto px-2 py-1 rounded-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      autoFocus
                    />
                  ) : (
                    <span className="text-lg text-yellow-400 ml-auto">
                      {userData.password}
                    </span>
                  )}
                  {editingField === 'password' ? (
                    <button
                      className="flex justify-center items-center cursor-pointer gap-1 px-2 py-1.5 rounded-sm bg-[#3f4044] w-fit"
                      onClick={handleCancel}
                    >
                      <span>Save</span>
                    </button>
                  ) : (
                    <button
                      className="flex justify-center items-center cursor-pointer gap-1 px-2 py-1.5 rounded-sm bg-[#3f4044] w-fit"
                      onClick={() => handleEditClick('password', userData.password)}
                    >
                      <span>Edit</span>
                      <img className="w-4 h-4" src="/typocalypse-tandem/Union.svg"></img>
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
