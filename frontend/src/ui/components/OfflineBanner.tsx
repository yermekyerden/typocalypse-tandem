import { useState, useEffect } from 'react';
import { useI18n } from '@/i18n/useI18n';

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const { t } = useI18n();
  useEffect(() => {
    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => setIsOffline(false);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);
  if (!isOffline) return null;
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-red-500/90 text-white text-sm text-center py-2">
      {t('offline.noInternet')}
    </div>
  );
}
