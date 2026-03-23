import { cn } from '@/lib/utils';
import { useState, useEffect, useCallback } from 'react';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { User } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { getInitials } from './utils';
import { DashboardScreen } from '../dashboard/DashboardScreen';
import { authService } from '@/api/authService';

type TabType = 'user-data' | 'progress' | 'settings';
type EditableField = 'username' | 'firstName' | 'lastName' | 'email' | 'password' | null;

export function ProfileScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('user-data');
  const [editingField, setEditingField] = useState<EditableField>(null);
  const [editValue, setEditValue] = useState('');
  const [passwordErrors, setPasswordErrors] = useState<string | null>(null);
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');

  function handleEditClick(field: EditableField, currentValue: string) {
    if (!field) return;
    setEditingField(field);
    setEditValue(currentValue);
  }

  const user = useAuthStore((state) => state.user);

  const hasName = user?.firstName || user?.lastName;

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

  async function handleSave() {
    if (!editingField || !user) return;

    const updatedData = {
      firstName: user.firstName || '',
      lastName: user.lastName || '',
    };

    if (editingField === 'firstName') updatedData.firstName = editValue;
    if (editingField === 'lastName') updatedData.lastName = editValue;

    try {
      await authService.updateProfile(updatedData);
      await fetchProfile();
      setEditingField(null);
      setEditValue('');
    } catch (e) {
      console.error(e);
    }
  }

  async function handleSavePassword() {
    if (!user || editingField !== 'password') return;

    try {
      await authService.changePassword({
        currentPassword: currentPasswordInput,
        newPassword: newPasswordInput,
      });

      setEditingField(null);
      setCurrentPasswordInput('');
      setNewPasswordInput('');
      setPasswordErrors(null);
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to change password';
      setPasswordErrors(errorMessage);
    }
  }

  return (
    <div className="px-4 py-6 bg-linear-to-b from-mist-950 to-mist-800 flex-1">
      <div className="mx-auto h-full flex gap-3">
        <div className="rounded-2xl bg-[#2c2c2c] h-full w-[25%] min-w-43.75 max-w-67.5 flex flex-col gap-2 px-2 py-2">
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
              User data
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
              Progress
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={cn(
              'flex flex-col text-left gap-2 rounded-lg bg-[#3f4044] p-4 focus-visible:ring-2 focus:outline-none focus-visible:ring-yellow-400',
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
          </button>
        </div>

        <div className="rounded-2xl bg-[#2c2c2c] p-8 shadow-xl backdrop-blur-sm h-full w-full flex flex-col max-h-[80vh] overflow-y-auto md:justify-between">
          {activeTab === 'user-data' && (
            <>
              <h1 className="mb-8 text-4xl font-bold text-yellow-400">
                {user?.firstName || user?.lastName
                  ? `${user?.firstName || ''} ${user?.lastName || ''}`.trim()
                  : user?.username}
              </h1>

              <div className="flex mb-8">
                <Avatar className="h-24 w-24 ring-4 ring-yellow-400/50">
                  <AvatarFallback className="bg-[#2c2c2c] text-yellow-400 text-4xl">
                    {hasName ? (
                      getInitials(user?.firstName || '', user?.lastName || '')
                    ) : (
                      <User size={40} />
                    )}
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
                      {user?.username}
                    </span>
                  )}
                </div>

                <div
                  className={cn(
                    'flex flex-col gap-4 rounded-lg p-4 border-b',
                    'md:flex-row md:items-center max-w-150 w-full',
                  )}
                >
                  <span className="text-sm uppercase tracking-wider text-white flex-1">
                    First Name
                  </span>
                  {editingField === 'firstName' ? (
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="text-lg bg-[#4f5054] text-yellow-400 ml-auto px-2 py-1 rounded-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      autoFocus
                    />
                  ) : (
                    <span className="text-lg text-yellow-400 ml-auto">
                      {user?.firstName || '—'}
                    </span>
                  )}
                  {editingField === 'firstName' ? (
                    <button
                      type="button"
                      className="flex justify-center items-center cursor-pointer gap-1 px-2 py-1.5 rounded-sm bg-[#3f4044] w-fit focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
                      onClick={handleSave}
                    >
                      <span>Save</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="flex justify-center items-center cursor-pointer gap-1 px-2 py-1.5 rounded-sm bg-[#3f4044] w-fit focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
                      onClick={() => handleEditClick('firstName', user?.firstName || '')}
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
                    Last Name
                  </span>
                  {editingField === 'lastName' ? (
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="text-lg bg-[#4f5054] text-yellow-400 ml-auto px-2 py-1 rounded-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      autoFocus
                    />
                  ) : (
                    <span className="text-lg text-yellow-400 ml-auto">
                      {user?.lastName || '—'}
                    </span>
                  )}
                  {editingField === 'lastName' ? (
                    <button
                      className="flex justify-center items-center cursor-pointer gap-1 px-2 py-1.5 rounded-sm bg-[#3f4044] w-fit focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
                      onClick={handleSave}
                    >
                      <span>Save</span>
                    </button>
                  ) : (
                    <button
                      className="flex justify-center items-center cursor-pointer gap-1 px-2 py-1.5 rounded-sm bg-[#3f4044] w-fit focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
                      onClick={() => handleEditClick('lastName', user?.lastName || '')}
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
                    <span className="text-lg text-yellow-400 ml-auto">{user?.email}</span>
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
                    <div className="flex flex-col gap-2 w-full">
                      <input
                        type="password"
                        placeholder="Current password"
                        value={currentPasswordInput}
                        onChange={(e) => setCurrentPasswordInput(e.target.value)}
                        className="bg-[#4f5054] text-yellow-400 px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        autoFocus
                      />
                      <input
                        type="password"
                        placeholder="New password"
                        value={newPasswordInput}
                        onChange={(e) => setNewPasswordInput(e.target.value)}
                        className="bg-[#4f5054] text-yellow-400 px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      />
                      {passwordErrors && (
                        <span className="text-red-500 text-sm">{passwordErrors}</span>
                      )}
                      <button
                        className="bg-[#3f4044] text-yellow-400 px-4 py-1 rounded mt-1 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
                        onClick={handleSavePassword}
                      >
                        Save
                      </button>
                      <button
                        className="bg-[#3f4044] text-yellow-400 px-4 py-1 rounded mt-1 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
                        onClick={() => {
                          setEditingField(null);
                          setCurrentPasswordInput('');
                          setNewPasswordInput('');
                          setPasswordErrors(null);
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setEditingField('password')}
                      className="flex items-center gap-1 px-2 py-1 bg-[#3f4044] rounded cursor-pointer w-fit focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
                    >
                      Edit
                      <img className="w-4 h-4" src="/typocalypse-tandem/Union.svg" />
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
          {activeTab === 'progress' && <DashboardScreen></DashboardScreen>}
        </div>
      </div>
    </div>
  );
}
