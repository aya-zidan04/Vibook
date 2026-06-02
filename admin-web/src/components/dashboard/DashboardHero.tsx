import { Link } from 'react-router-dom';
import { IconChevronRight } from '@/components/ui/icons';
import { useAdminI18n } from '@/i18n/useAdminI18n';
import { getAdminLocale } from '@/i18n/localeStore';

export function DashboardHero({
  firstName,
  pendingCount,
  approvalRatePercent,
  newUsers7d,
}: {
  firstName: string;
  pendingCount: number;
  approvalRatePercent: number;
  newUsers7d: number;
}) {
  const { t } = useAdminI18n();
  const locale = getAdminLocale() === 'ar' ? 'ar-JO' : 'en-US';
  const today = new Date().toLocaleDateString(locale, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <header className="vb-dashboard-hero vb-animate-in">
      <div className="vb-dashboard-hero__main">
        <p className="vb-dashboard-hero__eyebrow">{today}</p>
        <h1 className="vb-dashboard-hero__title">{t('dashboard.heroWelcome', { name: firstName })}</h1>
        <p className="vb-dashboard-hero__lede">{t('dashboard.heroLede')}</p>
      </div>
      <div className="vb-dashboard-hero__aside">
        <div className="vb-dashboard-hero__metrics" role="group" aria-label={t('dashboard.heroKeyMetrics')}>
          <div className="vb-dashboard-hero__metric">
            <span className="vb-dashboard-hero__metric-value">{pendingCount}</span>
            <span className="vb-dashboard-hero__metric-label">{t('dashboard.heroPendingReview')}</span>
          </div>
          <div className="vb-dashboard-hero__metric">
            <span className="vb-dashboard-hero__metric-value">{approvalRatePercent}%</span>
            <span className="vb-dashboard-hero__metric-label">{t('dashboard.heroApprovalRate')}</span>
          </div>
          <div className="vb-dashboard-hero__metric">
            <span className="vb-dashboard-hero__metric-value">{newUsers7d}</span>
            <span className="vb-dashboard-hero__metric-label">{t('dashboard.heroNewUsers7d')}</span>
          </div>
        </div>
        <Link to="/business-profiles" className="vb-dashboard-hero__cta">
          {pendingCount > 0
            ? t('dashboard.heroReviewQueue', { count: pendingCount })
            : t('dashboard.heroBusinessProfiles')}
          <IconChevronRight />
        </Link>
      </div>
    </header>
  );
}
