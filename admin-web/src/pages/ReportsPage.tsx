import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchAdminReportsPage, fetchAdminUserReportsPage } from '@/api/adminApi';
import type { AdminModerationReportResponse, AdminUserReportResponse } from '@/api/types';
import { ReportStatusBadge, UserReportStatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAdminI18n } from '@/i18n/useAdminI18n';
import { getFriendlyErrorMessage } from '@/utils/apiError';
import { formatDateTime } from '@/utils/format';
import { moderationReportTypeLabel } from '@/utils/moderationReportLabels';

type Tab = 'moderation' | 'problems';

function targetLink(r: AdminModerationReportResponse): string | null {
  if (r.targetId == null) return null;
  if (r.type === 'EVENT') return `/events/${r.targetId}`;
  if (r.type === 'USER') return `/users?userId=${r.targetId}`;
  if (r.type === 'BOOKING') return `/bookings/${r.targetId}`;
  if (r.type === 'RATING') return '/ratings';
  if (r.type === 'BUSINESS_PROFILE') return `/business-profiles/${r.targetId}`;
  return null;
}

function PaginationBar({
  page,
  totalPages,
  onPageChange,
  t,
}: {
  page: number;
  totalPages: number;
  onPageChange: (next: number) => void;
  t: (key: string) => string;
}) {
  return (
    <div className="vb-pagination">
      <span>
        {t('common.pageOf').replace('{n}', String(page + 1)).replace('{total}', String(Math.max(1, totalPages)))}
      </span>
      <Button variant="secondary" size="sm" disabled={page <= 0} onClick={() => onPageChange(page - 1)}>
        {t('common.previous')}
      </Button>
      <Button
        variant="secondary"
        size="sm"
        disabled={page >= totalPages - 1}
        onClick={() => onPageChange(page + 1)}
      >
        {t('common.next')}
      </Button>
    </div>
  );
}

export function ReportsPage() {
  const { t } = useAdminI18n();
  const [tab, setTab] = useState<Tab>('problems');

  const [modRows, setModRows] = useState<AdminModerationReportResponse[]>([]);
  const [modPage, setModPage] = useState(0);
  const [modTotalPages, setModTotalPages] = useState(0);

  const [userRows, setUserRows] = useState<AdminUserReportResponse[]>([]);
  const [userPage, setUserPage] = useState(0);
  const [userTotalPages, setUserTotalPages] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadModeration = useCallback(async () => {
    const data = await fetchAdminReportsPage({ page: modPage, size: 20, sort: 'createdAt,desc' });
    setModRows(data.content);
    setModTotalPages(data.totalPages);
  }, [modPage]);

  const loadUserReports = useCallback(async () => {
    const data = await fetchAdminUserReportsPage({ page: userPage, size: 20, sort: 'createdAt,desc' });
    setUserRows(data.content);
    setUserTotalPages(data.totalPages);
  }, [userPage]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (tab === 'moderation') {
        await loadModeration();
      } else {
        await loadUserReports();
      }
    } catch (e) {
      setError(getFriendlyErrorMessage(e, t('reports.loadError')));
    } finally {
      setLoading(false);
    }
  }, [tab, loadModeration, loadUserReports, t]);

  useEffect(() => {
    void load();
  }, [load]);

  if (error) {
    return (
      <div className="vb-page">
        <EmptyState title={t('reports.unavailable')} description={error} decor />
      </div>
    );
  }

  const activePage = tab === 'moderation' ? modPage : userPage;
  const activeTotalPages = tab === 'moderation' ? modTotalPages : userTotalPages;
  const setActivePage = tab === 'moderation' ? setModPage : setUserPage;

  return (
    <div className="vb-page vb-animate-in">
      <p className="vb-muted" style={{ marginTop: 0 }}>
        {t('reports.intro')}
      </p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <Button
          variant={tab === 'problems' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setTab('problems')}
        >
          {t('reports.tabProblems')}
        </Button>
        <Button
          variant={tab === 'moderation' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setTab('moderation')}
        >
          {t('reports.tabModeration')}
        </Button>
      </div>

      {loading ? (
        <div className="vb-table-wrap">
          <table className="vb-table">
            <thead>
              <tr>
                {Array.from({ length: tab === 'moderation' ? 8 : 7 }).map((_, i) => (
                  <th key={i}>…</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={tab === 'moderation' ? 8 : 7}>
                    <div className="vb-skeleton" style={{ height: 20 }} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : tab === 'moderation' ? (
        modRows.length === 0 ? (
          <EmptyState title={t('reports.noModeration')} description={t('reports.noModerationDesc')} decor />
        ) : (
          <>
            <div className="vb-table-wrap">
              <table className="vb-table">
                <thead>
                  <tr>
                    <th>{t('reports.id')}</th>
                    <th>{t('reports.reporter')}</th>
                    <th>{t('reports.type')}</th>
                    <th>{t('reports.target')}</th>
                    <th>{t('reports.reason')}</th>
                    <th>{t('reports.status')}</th>
                    <th>{t('reports.date')}</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {modRows.map((r) => {
                    const tHref = targetLink(r);
                    return (
                      <tr key={r.id}>
                        <td>{r.id}</td>
                        <td>
                          <Link to={`/users?userId=${r.reporterUserId}`}>{r.reporterEmail}</Link>
                        </td>
                        <td>{moderationReportTypeLabel(r.type, t)}</td>
                        <td>
                          {tHref && r.targetId != null ? (
                            <Link to={tHref}>#{r.targetId}</Link>
                          ) : r.targetId != null ? (
                            `#${r.targetId}`
                          ) : (
                            '—'
                          )}
                        </td>
                        <td style={{ maxWidth: 220, fontSize: '0.875rem' }}>{r.reason}</td>
                        <td>
                          <ReportStatusBadge status={r.status} />
                        </td>
                        <td>{formatDateTime(r.createdAt)}</td>
                        <td>
                          <Link to={`/reports/${r.id}`}>
                            <Button variant="secondary" size="sm">
                              {t('common.open')}
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <PaginationBar page={activePage} totalPages={activeTotalPages} onPageChange={setActivePage} t={t} />
          </>
        )
      ) : userRows.length === 0 ? (
        <EmptyState
          title={t('reports.noProblems')}
          description={t('reports.noProblemsDesc')}
          decor
        />
      ) : (
        <>
          <div className="vb-table-wrap">
            <table className="vb-table">
              <thead>
                <tr>
                  <th>{t('reports.id')}</th>
                  <th>{t('reports.user')}</th>
                  <th>{t('reports.subject')}</th>
                  <th>{t('reports.message')}</th>
                  <th>{t('reports.status')}</th>
                  <th>{t('reports.date')}</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {userRows.map((r) => (
                  <tr key={r.id}>
                    <td>{r.id}</td>
                    <td>
                      <Link to={`/users?userId=${r.userId}`}>{r.userEmail}</Link>
                    </td>
                    <td style={{ maxWidth: 180, fontSize: '0.875rem' }}>{r.subject}</td>
                    <td style={{ maxWidth: 260, fontSize: '0.875rem', whiteSpace: 'pre-wrap' }}>
                      {r.message.length > 100 ? `${r.message.slice(0, 100)}…` : r.message}
                    </td>
                    <td>
                      <UserReportStatusBadge status={r.status} />
                    </td>
                    <td>{formatDateTime(r.createdAt)}</td>
                    <td>
                      <Link to={`/reports/user/${r.id}`}>
                        <Button variant="secondary" size="sm">
                          {t('common.open')}
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <PaginationBar page={activePage} totalPages={activeTotalPages} onPageChange={setActivePage} t={t} />
        </>
      )}
    </div>
  );
}
