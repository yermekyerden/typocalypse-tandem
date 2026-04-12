import { cn } from '@/lib/utils';
import { useState } from 'react';

type AvatarPickerTab = 'preset' | 'upload';

type AvatarPickerProps = {
  isOpen: boolean;
  currentAvatarUrl?: string | null;
  presetAvatars: string[];
  onSelectAvatar: (src: string) => void;
  onUploadAvatar: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveAvatar: () => void;
  onClose: () => void;
};

export function AvatarPicker({
  isOpen,
  currentAvatarUrl,
  presetAvatars,
  onSelectAvatar,
  onUploadAvatar,
  onRemoveAvatar,
  onClose,
}: AvatarPickerProps) {
  const [avatarPickerTab, setAvatarPickerTab] = useState<AvatarPickerTab>('preset');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-[#2c2c2c] dark:bg-white rounded-2xl p-6 flex flex-col gap-4 shadow-xl w-full max-w-sm max-h-[90vh]">
        <div className="flex gap-2 border-b border-gray-200 dark:border-white/10 shrink-0">
          <button
            type="button"
            onClick={() => setAvatarPickerTab('preset')}
            className={cn(
              'pb-2 px-2 text-sm font-medium transition-colors cursor-pointer',
              avatarPickerTab === 'preset'
                ? 'text-yellow-400 border-b-2 border-yellow-400'
                : 'text-white/60 hover:text-white dark:text-gray-600 dark:hover:text-gray-900',
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
                : 'text-white/60 hover:text-white dark:text-gray-600 dark:hover:text-gray-90',
            )}
          >
            Upload photo
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          {avatarPickerTab === 'preset' ? (
            <div className="grid grid-cols-3 gap-3 pt-1 pb-1">
              {presetAvatars.map((src) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => onSelectAvatar(src)}
                  className={cn(
                    'h-20 w-20 mx-auto rounded-full overflow-hidden ring-2 transition focus:outline-none cursor-pointer',
                    currentAvatarUrl === src
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
                onChange={onUploadAvatar}
                className="hidden"
              />
              <p className="text-white/60 dark:text-gray-500 text-sm text-center">
                Supported formats: JPG, PNG, GIF
                <br />
                Max file size: 5MB
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between shrink-0 pt-2 border-t border-white/10">
          {currentAvatarUrl && (
            <button
              type="button"
              onClick={onRemoveAvatar}
              className="text-red-400 dark:text-red-500 hover:text-red-300 dark:hover:text-red-600 text-sm focus:outline-none cursor-pointer"
            >
              Remove avatar
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="text-white/60 dark:text-gray-500 hover:text-white dark:hover:text-gray-700 text-sm focus:outline-none cursor-pointer ml-auto"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
