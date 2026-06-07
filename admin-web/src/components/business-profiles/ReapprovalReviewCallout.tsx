import { Card } from '@/components/ui/Card';
import { useAdminI18n } from '@/i18n/useAdminI18n';

export function ReapprovalReviewCallout() {
  const { t } = useAdminI18n();
  return (
    <Card padding="md" className="vb-callout vb-callout--reapproval">
      <div className="vb-callout__title">{t('businessProfiles.reapprovalCalloutTitle')}</div>
      <p className="vb-callout__body">{t('businessProfiles.reapprovalCalloutBody')}</p>
    </Card>
  );
}

export function FirstTimeApplicationCallout() {
  const { t } = useAdminI18n();
  return (
    <Card padding="md" className="vb-callout vb-callout--neutral">
      <div className="vb-callout__title">{t('businessProfiles.firstTimeApplication')}</div>
      <p className="vb-callout__body">{t('businessProfiles.firstTimeApplicationBody')}</p>
    </Card>
  );
}
