import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/auth/useAuth';
import {
  fetchActivityLog,
  fetchAnalyticsSummary,
  fetchBusinessProfilesPage,
} from '@/api/adminApi';
import type {
  AdminActivityLogResponse,
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
import { activityActionLabel } from '@/utils/activityLogLabel';
import { getFriendlyErrorMessage } from '@/utils/apiError';
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

function RankedList({ title, rows, emptyHint }: { title: string; rows: NameCountResponse[]; emptyHint: string }) {
  return (
    <div className="vb-chart-card vb-animate-in">
      <h4 className="vb-chart-card__title">{title}</h4>
      <p className="vb-chart-card__hint">Based on live business profiles.</p>
      {rows.length === 0 ? (
        <p className="vb-muted" style={{ margin: 0 }}>
          {emptyHint}
        </p>
      ) : (
        <ol className="vb-rank-list">
          {rows.map((r) => (
            <li key={r.name}>
              <span className="vb-rank-list__name">{r.name}</span>
              <span className="vb-rank-list__count">{r.count}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

const FEED_ACTIONS = new Set<string>([
  'APPROVE_BUSINESS_PROFILE',
  'REJECT_BUSINESS_PROFILE',
  'BULK_APPROVE_BUSINESS_PROFILES',
  'BULK_REJECT_BUSINESS_PROFILES',
  'ENABLE_USER',
  'DISABLE_USER',
  'UPDATE_USER_ROLES',
]);

type DashboardState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | {
      status: 'ok';
      analytics: AdminAnalyticsSummaryResponse;
      activityFeed: AdminActivityLogResponse[];
      pendingPreview: BusinessProfileResponse[];
      recentProfiles: BusinessProfileResponse[];
    };

export function DashboardPage() {
  const { user } = useAuth();
  const [state, setState] = useState<DashboardState>({ status: 'loading' });
  /** Increment to re-run the dashboard data effect (retry). */
  const [loadKey, setLoadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const analyticsRaw = await fetchAnalyticsSummary();
        if (cancelled) return;

        const [activityRes, pendingRes, recentRes] = await Promise.allSettled([
          fetchActivityLog({ page: 0, size: 20 }),
          fetchBusinessProfilesPage({ status: 'PENDING_REVIEW', page: 0, size: 5, sort: 'createdAt,asc' }),
          fetchBusinessProfilesPage({ page: 0, size: 6, sort: 'createdAt,desc' }),
        ]);

        const activityPage =
          activityRes.status === 'fulfilled' ? activityRes.value : emptySpringPage<AdminActivityLogResponse>();
        const pendingPage =
          pendingRes.status === 'fulfilled' ? pendingRes.value : emptySpringPage<BusinessProfileResponse>();
        const recentPage =
          recentRes.status === 'fulfilled' ? recentRes.value : emptySpringPage<BusinessProfileResponse>();

        const activityFeed = activityPage.content.filter((e) => FEED_ACTIONS.has(e.action)).slice(0, 12);

        if (cancelled) return;
        setState({
          status: 'ok',
          analytics: normalizeAnalytics(analyticsRaw),
          activityFeed,
          pendingPreview: pendingPage.content,
          recentProfiles: recentPage.content,
        });
      } catch (e) {
        if (!cancelled) {
          setState({
            status: 'error',
            message: getFriendlyErrorMessage(e, 'Could not load dashboard.'),
          });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadKey]);

  if (state.status === 'loading') {
    return (
      <div className="vb-page vb-dashboard">
        <div className="vb-dashboard-hero vb-dashboard-hero--skeleton vb-skeleton" />
        <p className="vb-dashboard-section-label" style={{ marginTop: 'var(--vb-space-xxl)' }}>
          Metrics
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
          title="Dashboard unavailable"
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
              Retry loading dashboard
            </button>
          }
        />
      </div>
    );
  }

  const { analytics, activityFeed, pendingPreview, recentProfiles } = state;
  const first = user?.firstName?.trim() || 'there';
  const newUsers7d = sumLastDays(analytics.newUsersByDay, 7);

  return (
    <div className="vb-page vb-dashboard">
      <DashboardHero
        firstName={first}
        pendingCount={analytics.pendingBusinessProfiles}
        approvalRatePercent={analytics.approvalRatePercent}
        newUsers7d={newUsers7d}
      />

      <p className="vb-dashboard-section-label">Metrics</p>
      <div className="vb-stat-grid vb-dashboard-stat-grid">
        <StatCard label="Total users" value={analytics.totalUsers} hint="Registered accounts" icon={<IconUsers />} />
        <StatCard label="Active users" value={analytics.activeUsers} hint="Enabled accounts" icon={<IconCheck />} />
        <StatCard
          label="Business profiles"
          value={analytics.totalBusinessProfiles}
          hint="All statuses"
          icon={<IconBriefcase />}
        />
        <StatCard
          label="Pending approvals"
          value={analytics.pendingBusinessProfiles}
          hint="Awaiting review"
          icon={<IconClock />}
        />
        <StatCard
          label="Approval rate"
          value={`${analytics.approvalRatePercent}%`}
          hint="Share of decided reviews that were approved"
          icon={<IconSpark />}
        />
        <StatCard
          label="Rejection rate"
          value={`${analytics.rejectionRatePercent}%`}
          hint="Share of decided reviews that were rejected"
          icon={<IconX />}
        />
        <StatCard
          label="Approved"
          value={analytics.approvedBusinessProfiles}
          hint="Live on the platform"
          icon={<IconCheck />}
        />
        <StatCard
          label="Rejected"
          value={analytics.rejectedBusinessProfiles}
          hint="Sent back for edits"
          icon={<IconX />}
        />
        <StatCard
          label="Draft"
          value={analytics.draftBusinessProfiles}
          hint="Not yet submitted"
          icon={<IconSpark />}
        />
        <StatCard
          label="Bookings (30d)"
          value={sumLastDays(analytics.newBookingsByDay, 30)}
          hint={
            analytics.bookingsTrendAvailable
              ? 'New bookings per day in charts below'
              : 'Booking trend not available'
          }
          icon={<IconCalendar />}
        />
      </div>

      <p className="vb-dashboard-section-label">Analytics</p>
      <div className="vb-dashboard-grid">
        <div className="vb-chart-card vb-chart-card--accent">
          <h4 className="vb-chart-card__title">New users (30 days)</h4>
          <p className="vb-chart-card__hint">Daily registrations.</p>
          <UsersLineChart data={analytics.newUsersByDay} />
        </div>
        <div className="vb-chart-card vb-chart-card--accent">
          <h4 className="vb-chart-card__title">New business profiles (30 days)</h4>
          <p className="vb-chart-card__hint">Daily created profiles.</p>
          <BusinessLineChart data={analytics.newBusinessProfilesByDay} />
        </div>
        <div className="vb-chart-card vb-chart-card--accent">
          <h4 className="vb-chart-card__title">New bookings (30 days)</h4>
          <p className="vb-chart-card__hint">Daily booking volume from the platform.</p>
          <BookingsLineChart data={analytics.newBookingsByDay} />
        </div>
        <div className="vb-chart-card">
          <h4 className="vb-chart-card__title">Profiles by status</h4>
          <p className="vb-chart-card__hint">Current distribution.</p>
          <StatusBarChart data={analytics.businessProfilesByStatus} />
        </div>
        <div className="vb-chart-card">
          <h4 className="vb-chart-card__title">Categories</h4>
          <p className="vb-chart-card__hint">Share by primary category (top slices).</p>
          <CategoryPieChart data={(analytics.topCategories ?? []).slice(0, 6)} />
        </div>
      </div>

      <p className="vb-dashboard-section-label">Insights</p>
      <div className="vb-dashboard-grid vb-dashboard-grid--narrow">
        <RankedList title="Top performing categories" rows={analytics.topCategories} emptyHint="No categories in use yet." />
        <RankedList
          title="Most active governorates"
          rows={analytics.topGovernorates}
          emptyHint="No governorate data yet."
        />
      </div>

      <div className="vb-dashboard-split">
        <section className="vb-section vb-dashboard-section--flush">
          <div className="vb-section__head">
            <h3>Recent activity</h3>
            <Link to="/activity-log" className="vb-dashboard-link-more">
              View all
            </Link>
          </div>
          <Card padding="lg" className="vb-dashboard-card">
            {activityFeed.length === 0 ? (
              <EmptyState title="Quiet for now" description="Admin actions will stream here as they happen." />
            ) : (
              <ul className="vb-rank-list vb-rank-list--flush">
                {activityFeed.map((e) => (
                  <li key={e.id}>
                    <div>
                      <div className="vb-rank-list__name">{activityActionLabel(e.action)}</div>
                      <div className="vb-muted" style={{ fontSize: '0.8125rem', marginTop: 4 }}>
                        {e.adminEmail} · {formatDateTime(e.createdAt)}
                        {e.entityType === 'BUSINESS_PROFILE' ? (
                          <>
                            {' · '}
                            <Link to={`/business-profiles/${e.entityId}`}>Profile #{e.entityId}</Link>
                          </>
                        ) : null}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </section>

        <section className="vb-section vb-dashboard-section--flush">
          <div className="vb-section__head">
            <h3>Pending approvals</h3>
            <Link to="/business-profiles" className="vb-dashboard-link-more">
              View all
            </Link>
          </div>
          <Card padding="lg" className="vb-dashboard-card">
            {pendingPreview.length === 0 ? (
              <EmptyState title="All caught up" description="No business profiles waiting for review." decor />
            ) : (
              pendingPreview.map((p) => (
                <div key={p.id} className="vb-profile-row">
                  <div>
                    <Link to={`/business-profiles/${p.id}`}>{p.businessName}</Link>
                    <div className="vb-muted" style={{ fontSize: '0.8125rem', marginTop: 4 }}>
                      {p.ownerEmail ?? 'Owner email unavailable'} · {formatDateTime(p.createdAt)}
                    </div>
                  </div>
                  <StatusBadge status={p.status} />
                </div>
              ))
            )}
          </Card>
        </section>
      </div>

      <section className="vb-section">
        <div className="vb-section__head">
          <h3>Latest business profiles</h3>
        </div>
        <Card padding="lg">
          {recentProfiles.length === 0 ? (
            <EmptyState title="No profiles yet" description="New submissions will appear here." decor />
          ) : (
            recentProfiles.map((p) => (
              <div key={p.id} className="vb-profile-row">
                <div>
                  <Link to={`/business-profiles/${p.id}`}>{p.businessName}</Link>
                  <div className="vb-muted" style={{ fontSize: '0.8125rem', marginTop: 4 }}>
                    {p.primaryCategoryName ?? 'Category'} · {p.governorateName ?? 'Governorate'}
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
