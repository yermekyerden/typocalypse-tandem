import { cn } from '@/lib/utils';
import { useI18n } from '@/i18n/useI18n';
import { User } from 'lucide-react';
import { buildAvatarUrl, getInitials } from '../screens/profile/utils';
import { authService } from '@/api/authService';
import { PRESET_AVATARS } from '../screens/profile/constants';
import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { EditIcon } from './EditIcon';
import { AvatarPicker } from './AvatarPicker';

type EditableField = 'username' | 'firstName' | 'lastName' | 'email' | 'password' | null;

type User = ReturnType<typeof useAuthStore.getState>['user'];
type TranslationKey = Parameters<ReturnType<typeof useI18n>['t']>[0];

type ProfileField = {
  key: Exclude<EditableField, 'password' | null>;
  labelKey: TranslationKey;
  editable: boolean;
  getValue: (user: User) => string | undefined;
};

const profileFields: ProfileField[] = [
  {
    key: 'username',
    labelKey: 'profile.username',
    editable: false,
    getValue: (user) => user?.username,
  },
  {
    key: 'firstName',
    labelKey: 'profile.firstName',
    editable: true,
    getValue: (user) => user?.firstName,
  },
  {
    key: 'lastName',
    labelKey: 'profile.lastName',
    editable: true,
    getValue: (user) => user?.lastName,
  },
  {
    key: 'email',
    labelKey: 'profile.email',
    editable: false,
    getValue: (user) => user?.email,
  },
];

export function UserDataScreen() {
  const { t } = useI18n();
  const [editingField, setEditingField] = useState<EditableField>(null);
  const [editValue, setEditValue] = useState('');
  const [passwordErrors, setPasswordErrors] = useState<string | null>(null);
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  const fetchProfile = useAuthStore((state) => state.fetchProfile);

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
    } catch (error) {
      console.error(error);
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
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : t('profile.changePasswordFailed');
      setPasswordErrors(errorMessage);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSelectAvatar(src: string) {
    try {
      const response = await fetch(src);
      const blob = await response.blob();
      const extension = blob.type.split('/')[1] || 'png';
      const file = new File([blob], `avatar.${extension}`, { type: blob.type });

      await authService.updateAvatar(file);
      await fetchProfile();
      setShowAvatarPicker(false);
    } catch (error) {
      console.error(error);
    }
  }

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await authService.updateAvatar(file);
      await fetchProfile();
      setShowAvatarPicker(false);
    } catch (error) {
      console.error(error);
    }
  }

  async function handleRemoveAvatar() {
    try {
      await authService.removeAvatar();
      await fetchProfile();
      setShowAvatarPicker(false);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <>
      <h1 className="mb-8 text-4xl font-bold text-yellow-400 dark:text-mist-900">
        {user?.firstName || user?.lastName
          ? `${user?.firstName || ''} ${user?.lastName || ''}`.trim()
          : user?.username}
      </h1>

      <div className="flex mb-8">
        <div className="relative w-fit">
          <div className="h-24 w-24 rounded-full bg-gray-700 ring-4 ring-yellow-400/50 overflow-hidden flex items-center justify-center text-yellow-400 text-4xl theme-text dark:ring-mist-200">
            {user?.avatarUrl ? (
              <img
                src={buildAvatarUrl(user.avatarUrl) ?? undefined}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : hasName ? (
              getInitials(user.firstName || '', user.lastName || '')
            ) : (
              <User size={40} />
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowAvatarPicker(true)}
            className={cn(
              'absolute bottom-0 right-0 h-7 w-7 rounded-full bg-yellow-400 text-gray-900 flex items-center justify-center pb-0.5 dark:bg-mist-100',
              'hover:bg-yellow-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 font-bold text-xl leading-none cursor-pointer',
            )}
          >
            +
          </button>
        </div>
      </div>

      <AvatarPicker
        isOpen={showAvatarPicker}
        currentAvatarUrl={user?.avatarUrl}
        presetAvatars={PRESET_AVATARS}
        onSelectAvatar={handleSelectAvatar}
        onUploadAvatar={handleFileUpload}
        onRemoveAvatar={handleRemoveAvatar}
        onClose={() => setShowAvatarPicker(false)}
      />

      <div className="space-y-6">
        {profileFields.map((field) => {
          const isEditing = editingField === field.key;
          const rawValue = field.getValue(user);
          const value = rawValue ?? (field.key === 'lastName' ? t('common.notSet') : '—');

          return (
            <div
              key={field.key}
              className={cn(
                'flex flex-col gap-4 rounded-lg p-4 border-b dark:border-mist-400',
                'md:flex-row md:items-center max-w-150 w-full',
              )}
            >
              <span className="text-sm uppercase tracking-wider text-white flex-1 dark:text-mist-900">
                {t(field.labelKey)}
              </span>

              {isEditing ? (
                <input
                  type="text"
                  value={editValue}
                  onChange={(event) => setEditValue(event.target.value)}
                  className="text-lg bg-[#4f5054] text-yellow-400 ml-auto px-2 py-1 rounded-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 dark:bg-mist-200 dark:text-mist-900 dark:focus:ring-indigo-300"
                  autoFocus
                />
              ) : (
                <span className="text-lg text-yellow-400 ml-auto dark:text-mist-900">
                  {value}
                </span>
              )}

              {field.editable &&
                (isEditing ? (
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex justify-center items-center cursor-pointer gap-1 px-2 py-1.5 rounded-sm bg-[#3f4044] w-fit focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 dark:text-mist-900 dark:bg-mist-200"
                  >
                    <span>{isSaving ? t('common.saving') : t('common.save')}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleEditClick(field.key, rawValue ?? '')}
                    className="flex justify-center items-center cursor-pointer gap-1 px-2 py-1.5 rounded-sm bg-[#3f4044] w-fit focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 dark:text-mist-900 dark:bg-mist-200"
                  >
                    <span>{t('common.edit')}</span>
                    <EditIcon />
                  </button>
                ))}
            </div>
          );
        })}

        <div
          className={cn(
            'flex flex-col gap-4 rounded-lg p-4 border-b dark:border-mist-400',
            'md:flex-row md:items-center max-w-150 w-full',
          )}
        >
          <span className="text-sm uppercase tracking-wider text-white flex-1 dark:text-mist-900">
            {t('profile.password')}
          </span>

          {editingField === 'password' ? (
            <div className="flex flex-col gap-2 w-full">
              <input
                type="password"
                placeholder={t('profile.currentPassword')}
                value={currentPasswordInput}
                onChange={(event) => setCurrentPasswordInput(event.target.value)}
                className="bg-[#4f5054] text-yellow-400 px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-yellow-400"
                autoFocus
              />

              <input
                type="password"
                placeholder={t('profile.newPassword')}
                value={newPasswordInput}
                onChange={(event) => setNewPasswordInput(event.target.value)}
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
              className="flex items-center gap-1 px-2 py-1 bg-[#3f4044] rounded cursor-pointer w-fit focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 dark:text-mist-900 dark:bg-mist-200"
            >
              {t('common.edit')}
              <EditIcon />
            </button>
          )}
        </div>
      </div>
    </>
  );
}
