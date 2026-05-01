import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchAdminReportsPage } from '@/api/adminApi';
import type { AdminModerationReportResponse } from '@/api/types';
import { ReportStatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { getFriendlyErrorMessage } from '@/utils/apiError';
import { formatDateTime } from '@/utils/format';

function targetLink(r: AdminModerationReportResponse): string | null {
  if (r.targetId == null) return null;
  if (r.type === 'EVENT') return `/events/${r.targetId}`;
  if (r.type === 'USER') return `/users?userId=${r.targetId}`;
  if (r.type === 'BOOKING') return `/bookings/${r.targetId}`;
  if (r.type === 'RATING') return '/ratings';
  if (r.type === 'BUSINESS_PROFILE') return `/business-profiles/${r.targetId}`;
  return null;
}

export function ReportsPage() {
  const [rows, setRows] = useState<AdminModerationReportResponse[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminReportsPage({ page, size: 20, sort: 'createdAt,desc' });
      setRows(data.content);
      setTotalPages(data.totalPages);
    } catch (e) {
      setError(getFriendlyErrorMessage(e, 'Could not load reports.'));
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    void load();
  }, [load]);

  if (error) {
    return (
      <div className="vb-page">
        <EmptyState title="Reports unavailable" description={error} decor />
      </div>
    );
  }

  return (
    <div className="vb-page vb-animate-in">
      <p className="vb-muted" style={{ marginTop: 0 }}>
        Complaints and flags. Rows appear when reports exist in the database (e.g. from future user flows).
      </p>
      {loading ? (
        <div className="vb-table-wrap">
          <table className="vb-table">
            <thead>
              <tr>
                {['ID', 'Reporter', 'Type', 'Target', 'Reason', 'Status', 'Created', 'Actions'].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={8}>
                    <div className="vb-skeleton" style={{ height: 20 }} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : rows.length === 0 ? (
        <EmptyState title="No reports yet" description="The moderation queue is empty." decor />
      ) : (
        <>
          <div className="vb-table-wrap">
            <table className="vb-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Reporter</th>
                  <th>Type</th>
                  <th>Target</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const tHref = targetLink(r);
                  return (
                  <tr key={r.id}>
                    <td>{r.id}</td>
                    <td>
                      <Link to={`/users?userId=${r.reporterUserId}`}>{r.reporterEmail}</Link>
                    </td>
                    <td>{r.type}</td>
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
                          Open
                        </Button>
                      </Link>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="vb-pagination">
            <span>
              Page {page + 1} of {Math.max(1, totalPages)}
            </span>
            <Button variant="secondary" size="sm" disabled={page <= 0} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
