import { useParams } from 'react-router-dom';
import { useI18n } from '@/i18n/useI18n';

export function MissionRunScreen() {
  const { missionId } = useParams();
  const { t } = useI18n();

  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold">{t('missionRun.title')}</h1>
      <p className="text-sm text-muted-foreground">
        {t('missionRun.missionId', { missionId: missionId ?? '' })}
      </p>
    </div>
  );
}
