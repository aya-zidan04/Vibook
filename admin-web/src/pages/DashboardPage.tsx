import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/auth/useAuth';
import {
  fetchAnalyticsSummary,
  fetchBusinessProfilesPage,
} from '@/api/adminApi';
import type {
  AdminAnalyticsSummaryResponse,
  BusinessProfileResponse,
  NameCountResponse,
} from '@/api/types';
import { BookingsLineChart } from '@/components/charts/BookingsLineChart';
import { BusinessLineChart } from '@/components/charts/BusinessLineChart';
import { CategoryPieChart } from '@/components/charts/CategoryPieChart';
import { StatusBarChart } from '@/components/charts/StatusBarChart';
import { UsersLineChart } from '@/components/charts/UsersLineChart';
import { DashboardHero } from '@/components/dashboard/DashboardHero';
import { StatCard } from '@/components/dashboard/StatCard';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import {
  IconBriefcase,
  IconCalendar,
  IconCheck,
  IconClock,
  IconSpark,
  IconUsers,
  IconX,
} from '@/components/ui/icons';
import { StatCardSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAdminI18n } from '@/i18n/useAdminI18n';
import { getFriendlyErrorMessage } from '@/utils/apiError';
import { localizedGovernorateName } from '@/utils/governorateLabels';
import { formatDateTime } from '@/utils/format';
import { sumLastDays } from '@/utils/timeSeries';

function normalizeAnalytics(raw: AdminAnalyticsSummaryResponse): AdminAnalyticsSummaryResponse {
  return {
    ...raw,
    newUsersByDay: raw.newUsersByDay ?? [],
    newBusinessProfilesByDay: raw.newBusinessProfilesByDay ?? [],
    newBookingsByDay: raw.newBookingsByDay ?? [],
    businessProfilesByStatus: raw.businessProfilesByStatus ?? [],
    topCategories: raw.topCategories ?? [],
    topGovernorates: raw.topGovernorates ?? [],
  };
}

function emptySpringPage<T>(): { content: T[] } {
  return { content: [] };
}

function RankedList({
  title,
  rows,
  emptyHint,
  formatName,
}: {
  title: string;
  rows: NameCountResponse[];
  emptyHint: string;
  formatName?: (name: string) => string;
}) {
  const { t } = useAdminI18n();
  return (
    <div className="vb-chart-card vb-animate-in">
      <h4 className="vb-chart-card__title">{title}</h4>
      <p className="vb-chart-card__hint">{t('dashboard.rankHint')}</p>
      {rows.length === 0 ? (
        <p className="vb-muted" style={{ margin: 0 }}>
          {emptyHint}
        </p>
      ) : (
        <ol className="vb-rank-list">
          {rows.map((r) => (
            <li key={r.name}>
              <span className="vb-rank-list__name">{formatName ? formatName(r.name) : r.name}</span>
              <span className="vb-rank-list__count">{r.count}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

type DashboardState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | {
      status: 'ok';
      analytics: AdminAnalyticsSummaryResponse;
      pendingPreview: BusinessProfileResponse[];
      recentProfiles: BusinessProfileResponse[];
    };

export function DashboardPage() {
  const { t, locale } = useAdminI18n();
  const { user } = useAuth();
  const [state, setState] = useState<DashboardState>({ status: 'loading' });
  const [loadKey, setLoadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const analyticsRaw = await fetchAnalyticsSummary();
        if (cancelled) return;

        const [pendingRes, recentRes] = await Promise.allSettled([
          fetchBusinessProfilesPage({ status: 'PENDING_REVIEW', page: 0, size: 5, sort: 'createdAt,asc' }),
          fetchBusinessProfilesPage({ page: 0, size: 6, sort: 'createdAt,desc' }),
        ]);

        const pendingPage =
          pendingRes.status === 'fulfilled' ? pendingRes.value : emptySpringPage<BusinessProfileResponse>();
        const recentPage =
          recentRes.status === 'fulfilled' ? recentRes.value : emptySpringPage<BusinessProfileResponse>();

        if (cancelled) return;
        setState({
          status: 'ok',
          analytics: normalizeAnalytics(analyticsRaw),
          pendingPreview: pendingPage.content,
          recentProfiles: recentPage.content,
        });
      } catch (e) {
        if (!cancelled) {
          setState({
            status: 'error',
            message: getFriendlyErrorMessage(e, t('dashboard.loadError')),
          });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadKey, t]);

  if (state.status === 'loading') {
    return (
      <div className="vb-page vb-dashboard">
        <div className="vb-dashboard-hero vb-dashboard-hero--skeleton vb-skeleton" />
        <p className="vb-dashboard-section-label" style={{ marginTop: 'var(--vb-space-xxl)' }}>
          {t('dashboard.metrics')}
        </p>
        <div className="vb-stat-grid vb-dashboard-stat-grid">
          {Array.from({ length: 10 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="vb-page vb-dashboard">
        <EmptyState
          title={t('dashboard.unavailable')}
          description={state.message}
          decor
          action={
            <button
              type="button"
              className="vb-quick-action"
              style={{ display: 'inline-flex', border: 'none', cursor: 'pointer', font: 'inherit' }}
              onClick={() => {
                setState({ status: 'loading' });
                setLoadKey((k) => k + 1);
              }}
            >
              {t('dashboard.retry')}
            </button>
          }
        />
      </div>
    );
  }

  const { analytics, pendingPreview, recentProfiles } = state;
  const first = user?.firstName?.trim() || t('dashboard.welcomeThere');
  const newUsers7d = sumLastDays(analytics.newUsersByDay, 7);

  return (
    <div className="vb-page vb-dashboard">
      <DashboardHero
        firstName={first}
        pendingCount={analytics.pendingBusinessProfiles}
        approvalRatePercent={analytics.approvalRatePercent}
        newUsers7d={newUsers7d}
      />

      <p className="vb-dashboard-section-label">{t('dashboard.metrics')}</p>
      <div className="vb-stat-grid vb-dashboard-stat-grid">
        <StatCard label={t('dashboard.statTotalUsers')} value={analytics.totalUsers} hint={t('dashboard.statTotalUsersHint')} icon={<IconUsers />} />
        <StatCard label={t('dashboard.statActiveUsers')} value={analytics.activeUsers} hint={t('dashboard.statActiveUsersHint')} icon={<IconCheck />} />
        <StatCard
          label={t('dashboard.statBusinessProfiles')}
          value={analytics.totalBusinessProfiles}
          hint={t('dashboard.statBusinessProfilesHint')}
          icon={<IconBriefcase />}
        />
        <StatCard
          label={t('dashboard.statPending')}
          value={analytics.pendingBusinessProfiles}
          hint={t('dashboard.statPendingHint')}
          icon={<IconClock />}
        />
        <StatCard
          label={t('dashboard.statApprovalRate')}
          value={`${analytics.approvalRatePercent}%`}
          hint={t('dashboard.statApprovalRateHint')}
          icon={<IconSpark />}
        />
        <StatCard
          label={t('dashboard.statRejectionRate')}
          value={`${analytics.rejectionRatePercent}%`}
          hint={t('dashboard.statRejectionRateHint')}
          icon={<IconX />}
        />
        <StatCard
          label={t('dashboard.statApproved')}
          value={analytics.approvedBusinessProfiles}
          hint={t('dashboard.statApprovedHint')}
          icon={<IconCheck />}
        />
        <StatCard
          label={t('dashboard.statRejected')}
          value={analytics.rejectedBusinessProfiles}
          hint={t('dashboard.statRejectedHint')}
          icon={<IconX />}
        />
        <StatCard
          label={t('dashboard.statDraft')}
          value={analytics.draftBusinessProfiles}
          hint={t('dashboard.statDraftHint')}
          icon={<IconSpark />}
        />
        <StatCard
          label={t('dashboard.statBookings30d')}
          value={sumLastDays(analytics.newBookingsByDay, 30)}
          hint={
            analytics.bookingsTrendAvailable
              ? t('dashboard.statBookings30dHintTrend')
              : t('dashboard.statBookings30dHintNoTrend')
          }
          icon={<IconCalendar />}
        />
      </div>

      <p className="vb-dashboard-section-label">{t('dashboard.analytics')}</p>
      <div className="vb-dashboard-grid">
        <div className="vb-chart-card vb-chart-card--accent">
          <h4 className="vb-chart-card__title">{t('dashboard.chartNewUsers')}</h4>
          <p className="vb-chart-card__hint">{t('dashboard.chartNewUsersHint')}</p>
          <UsersLineChart data={analytics.newUsersByDay} />
        </div>
        <div className="vb-chart-card vb-chart-card--accent">
          <h4 className="vb-chart-card__title">{t('dashboard.chartNewProfiles')}</h4>
          <p className="vb-chart-card__hint">{t('dashboard.chartNewProfilesHint')}</p>
          <BusinessLineChart data={analytics.newBusinessProfilesByDay} />
        </div>
        <div className="vb-chart-card vb-chart-card--accent">
          <h4 className="vb-chart-card__title">{t('dashboard.chartNewBookings')}</h4>
          <p className="vb-chart-card__hint">{t('dashboard.chartNewBookingsHint')}</p>
          <BookingsLineChart data={analytics.newBookingsByDay} />
        </div>
        <div className="vb-chart-card">
          <h4 className="vb-chart-card__title">{t('dashboard.chartByStatus')}</h4>
          <p className="vb-chart-card__hint">{t('dashboard.chartByStatusHint')}</p>
          <StatusBarChart data={analytics.businessProfilesByStatus} />
        </div>
        <div className="vb-chart-card">
          <h4 className="vb-chart-card__title">{t('dashboard.chartCategories')}</h4>
          <p className="vb-chart-card__hint">{t('dashboard.chartCategoriesHint')}</p>
          <CategoryPieChart data={(analytics.topCategories ?? []).slice(0, 6)} />
        </div>
      </div>

      <p className="vb-dashboard-section-label">{t('dashboard.insights')}</p>
      <div className="vb-dashboard-grid vb-dashboard-grid--narrow">
        <RankedList
          title={t('dashboard.topCategories')}
          rows={analytics.topCategories}
          emptyHint={t('dashboard.topCategoriesEmpty')}
        />
        <RankedList
          title={t('dashboard.topGovernorates')}
          rows={analytics.topGovernorates}
          emptyHint={t('dashboard.topGovernoratesEmpty')}
          formatName={(name) => localizedGovernorateName(name, locale)}
        />
      </div>

      <section className="vb-section vb-dashboard-section--flush">
        <div className="vb-section__head">
          <h3>{t('dashboard.pendingApprovals')}</h3>
          <Link to="/business-profiles" className="vb-dashboard-link-more">
            {t('dashboard.viewAll')}
          </Link>
        </div>
        <Card padding="lg" className="vb-dashboard-card">
          {pendingPreview.length === 0 ? (
            <EmptyState title={t('dashboard.allCaughtUp')} description={t('dashboard.noPending')} decor />
          ) : (
            pendingPreview.map((p) => (
              <div key={p.id} className="vb-profile-row">
                <div>
                  <Link to={`/business-profiles/${p.id}`}>{p.businessName}</Link>
                  <div className="vb-muted" style={{ fontSize: '0.8125rem', marginTop: 4 }}>
                    {p.ownerEmail ?? t('dashboard.ownerEmailUnavailable')} · {formatDateTime(p.createdAt)}
                  </div>
                </div>
                <StatusBadge status={p.status} />
              </div>
            ))
          )}
        </Card>
      </section>

      <section className="vb-section">
        <div className="vb-section__head">
          <h3>{t('dashboard.latestProfiles')}</h3>
        </div>
        <Card padding="lg">
          {recentProfiles.length === 0 ? (
            <EmptyState title={t('dashboard.noProfilesYet')} description={t('dashboard.noProfilesYetDesc')} decor />
          ) : (
            recentProfiles.map((p) => (
              <div key={p.id} className="vb-profile-row">
                <div>
                  <Link to={`/business-profiles/${p.id}`}>{p.businessName}</Link>
                  <div className="vb-muted" style={{ fontSize: '0.8125rem', marginTop: 4 }}>
                    {p.primaryCategoryName ?? t('dashboard.categoryFallback')} ·{' '}
                    {p.governorateName
                      ? localizedGovernorateName(p.governorateName, locale)
                      : t('dashboard.governorateFallback')}
                  </div>
                </div>
                <StatusBadge status={p.status} />
              </div>
            ))
          )}
        </Card>
      </section>
    </div>
  );
}
