import { cn } from '@/lib/utils';
import { useI18n } from '@/i18n/useI18n';
import { User } from 'lucide-react';
import { getInitials } from '../screens/profile/utils';
import { authService } from '@/api/authService';
import { PRESET_AVATARS } from '../screens/profile/constants';
import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';

type EditableField = 'username' | 'firstName' | 'lastName' | 'email' | 'password' | null;

export function UserDataScreen() {
  const { t } = useI18n();
  const [editingField, setEditingField] = useState<EditableField>(null);
  const [editValue, setEditValue] = useState('');
  const [passwordErrors, setPasswordErrors] = useState<string | null>(null);
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [avatarPickerTab, setAvatarPickerTab] = useState<'preset' | 'upload'>('preset');

  const fetchProfile = useAuthStore((s) => s.fetchProfile);

  const user = useAuthStore((state) => state.user);
  const hasName = user?.firstName || user?.lastName;

  function handleEditClick(field: EditableField, currentValue: string) {
    if (!field) return;
    setEditingField(field);
    setEditValue(currentValue);
  }

  async function handleSave() {
    if (!editingField || !user) return;

    const updatedData = {
      firstName: user.firstName || '',
      lastName: user.lastName || '',
    };

    if (editingField === 'firstName') updatedData.firstName = editValue;
    if (editingField === 'lastName') updatedData.lastName = editValue;

    setIsSaving(true);

    try {
      await authService.updateProfile(updatedData);
      await fetchProfile();
      setEditingField(null);
      setEditValue('');
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSavePassword() {
    if (!user || editingField !== 'password') return;
    setIsSaving(true);
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
      const errorMessage =
        e instanceof Error ? e.message : t('profile.changePasswordFailed');
      setPasswordErrors(errorMessage);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSelectAvatar(src: string) {
    try {
      const res = await fetch(src);
      const blob = await res.blob();
      const ext = blob.type.split('/')[1] || 'png';
      const file = new File([blob], `avatar.${ext}`, { type: blob.type });
      await authService.updateAvatar(file);
      await fetchProfile();
      setShowAvatarPicker(false);
    } catch (e) {
      console.error(e);
    }
  }

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await authService.updateAvatar(file);
      await fetchProfile();
      setShowAvatarPicker(false);
    } catch (e) {
      console.error(e);
    }
  }
  return (
    <>
      <h1 className="mb-8 text-4xl font-bold text-yellow-400">
        {user?.firstName || user?.lastName
          ? `${user?.firstName || ''} ${user?.lastName || ''}`.trim()
          : user?.username}
      </h1>

      <div className="flex mb-8">
        <div className="relative w-fit">
          <div className="h-24 w-24 rounded-full bg-gray-700 ring-4 ring-yellow-400/50 overflow-hidden flex items-center justify-center text-yellow-400 text-4xl">
            {user?.avatarUrl ? (
              <img
                src={`/api${user.avatarUrl}`}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : hasName ? (
              getInitials(user?.firstName || '', user?.lastName || '')
            ) : (
              <User size={40} />
            )}
          </div>
          <button
            type="button"
            onClick={() => setShowAvatarPicker(true)}
            className={cn(
              'absolute bottom-0 right-0 h-7 w-7 rounded-full bg-yellow-400 text-gray-900 flex items-center justify-center pb-0.5',
              'hover:bg-yellow-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 font-bold text-xl leading-none cursor-pointer',
            )}
          >
            +
          </button>
        </div>
      </div>

      {showAvatarPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-[#2c2c2c] rounded-2xl p-6 flex flex-col gap-4 shadow-xl w-full max-w-sm max-h-[90vh]">
            <div className="flex gap-2 border-b border-white/10 shrink-0">
              <button
                type="button"
                onClick={() => setAvatarPickerTab('preset')}
                className={cn(
                  'pb-2 px-2 text-sm font-medium transition-colors cursor-pointer',
                  avatarPickerTab === 'preset'
                    ? 'text-yellow-400 border-b-2 border-yellow-400'
                    : 'text-white/60 hover:text-white',
                )}
              >
                Preset avatars
              </button>
              <button
                type="button"
                onClick={() => setAvatarPickerTab('upload')}
                className={cn(
                  'pb-2 px-2 text-sm font-medium transition-colors cursor-pointer',
                  avatarPickerTab === 'upload'
                    ? 'text-yellow-400 border-b-2 border-yellow-400'
                    : 'text-white/60 hover:text-white',
                )}
              >
                Upload photo
              </button>
            </div>
            <div className="overflow-y-auto flex-1">
              {avatarPickerTab === 'preset' ? (
                <div className="grid grid-cols-3 gap-3 pt-1 pb-1">
                  {PRESET_AVATARS.map((src) => (
                    <button
                      key={src}
                      type="button"
                      onClick={() => handleSelectAvatar(src)}
                      className={cn(
                        'h-20 w-20 mx-auto rounded-full overflow-hidden ring-2 transition focus:outline-none cursor-pointer',
                        user?.avatarUrl === src
                          ? 'ring-yellow-400'
                          : 'ring-transparent hover:ring-yellow-400/50',
                      )}
                    >
                      <img src={src} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-4 py-8">
                  <label
                    htmlFor="avatar-upload"
                    className={cn(
                      'cursor-pointer bg-yellow-400 text-gray-900 px-4 py-2 rounded-lg',
                      'hover:bg-yellow-300 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400',
                    )}
                  >
                    Choose file
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <p className="text-white/60 text-sm text-center">
                    Supported formats: JPG, PNG, GIF
                    <br />
                    Max file size: 5MB
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between shrink-0 pt-2 border-t border-white/10">
              {user?.avatarUrl && (
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await authService.removeAvatar();
                      await fetchProfile();
                      setShowAvatarPicker(false);
                    } catch (e) {
                      console.error(e);
                    }
                  }}
                  className="text-red-400 hover:text-red-300 text-sm focus:outline-none cursor-pointer"
                >
                  Remove avatar
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowAvatarPicker(false)}
                className="text-white/60 hover:text-white text-sm focus:outline-none cursor-pointer ml-auto"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div
          className={cn(
            'flex flex-col gap-4 rounded-lg p-4 border-b',
            'md:flex-row md:items-center max-w-150 w-full',
          )}
        >
          <span className="text-sm uppercase tracking-wider text-white flex-1">
            {t('profile.username')}
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
            <span className="text-lg text-yellow-400 ml-auto">{user?.username}</span>
          )}
        </div>

        <div
          className={cn(
            'flex flex-col gap-4 rounded-lg p-4 border-b',
            'md:flex-row md:items-center max-w-150 w-full',
          )}
        >
          <span className="text-sm uppercase tracking-wider text-white flex-1">
            {t('profile.firstName')}
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
              disabled={isSaving}
            >
              <span>{isSaving ? t('common.saving') : t('common.save')}</span>
            </button>
          ) : (
            <button
              type="button"
              className="flex justify-center items-center cursor-pointer gap-1 px-2 py-1.5 rounded-sm bg-[#3f4044] w-fit focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
              onClick={() => handleEditClick('firstName', user?.firstName || '')}
            >
              <span>{t('common.edit')}</span>
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
            {t('profile.lastName')}
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
              {user?.lastName || t('common.notSet')}
            </span>
          )}
          {editingField === 'lastName' ? (
            <button
              className="flex justify-center items-center cursor-pointer gap-1 px-2 py-1.5 rounded-sm bg-[#3f4044] w-fit focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
              onClick={handleSave}
              disabled={isSaving}
            >
              <span>{isSaving ? t('common.saving') : t('common.save')}</span>
            </button>
          ) : (
            <button
              className="flex justify-center items-center cursor-pointer gap-1 px-2 py-1.5 rounded-sm bg-[#3f4044] w-fit focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
              onClick={() => handleEditClick('lastName', user?.lastName || '')}
            >
              <span>{t('common.edit')}</span>
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
            {t('profile.email')}
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
            {t('profile.password')}
          </span>
          {editingField === 'password' ? (
            <div className="flex flex-col gap-2 w-full">
              <input
                type="password"
                placeholder={t('profile.currentPassword')}
                value={currentPasswordInput}
                onChange={(e) => setCurrentPasswordInput(e.target.value)}
                className="bg-[#4f5054] text-yellow-400 px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-yellow-400"
                autoFocus
              />
              <input
                type="password"
                placeholder={t('profile.newPassword')}
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
                {isSaving ? t('common.saving') : t('common.save')}
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
                {t('common.cancel')}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditingField('password')}
              className="flex items-center gap-1 px-2 py-1 bg-[#3f4044] rounded cursor-pointer w-fit focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
            >
              {t('common.edit')}
              <img className="w-4 h-4" src="/typocalypse-tandem/Union.svg" />
            </button>
          )}
        </div>
      </div>
    </>
  );
}
