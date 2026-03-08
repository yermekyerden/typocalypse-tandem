type ProfileModalProps = {
  onClose: () => void;
};

export function ProfileModal({ onClose }: ProfileModalProps) {
  return (
    <div className="fixed inset-0 z-50 backdrop-blur-[2px]" onClick={onClose}>
      <div
        className="absolute right-10 top-[72px] bg-mist-900 p-4 rounded-lg text-yellow-50 shadow-[0_0_10px_rgba(250,204,21,0.6)]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="cursor-pointer hover:text-yellow-400">Profile</h2>
        <h2 className="cursor-pointer hover:text-yellow-400">Theme</h2>
        <h2 className="cursor-pointer hover:text-yellow-400">Help</h2>
        <h2 className="cursor-pointer hover:text-yellow-400">Logout</h2>
        <h2 className="cursor-pointer hover:text-yellow-400">Properties</h2>
      </div>
    </div>
  );
}
