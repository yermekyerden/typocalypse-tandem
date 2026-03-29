import { useParams } from 'react-router-dom';
import { useI18n } from '@/i18n/I18nProvider';

export function ReplayScreen() {
  const { attemptId } = useParams();
  const { t } = useI18n();

  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold">{t('replay.title')}</h1>
      <p className="text-sm text-muted-foreground">
        {t('replay.attemptId', { attemptId: attemptId ?? '' })}
      </p>
    </div>
  );
}
