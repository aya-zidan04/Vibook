import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchActivityLog } from '@/api/adminApi';
import type { AdminActivityLogResponse } from '@/api/types';
import { activityActionLabel } from '@/utils/activityLogLabel';
import { getFriendlyErrorMessage } from '@/utils/apiError';
import { formatDateTime } from '@/utils/format';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';

const PAGE_SIZE = 25;

export function ActivityLogPage() {
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState<AdminActivityLogResponse[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (p: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchActivityLog({ page: p, size: PAGE_SIZE });
      setRows(data.content);
      setTotalPages(data.totalPages);
    } catch (e) {
      setError(getFriendlyErrorMessage(e, 'Could not load activity log.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(page);
  }, [page, load]);

  if (error) {
    return (
      <div className="vb-page">
        <EmptyState title="Activity log unavailable" description={error} decor />
      </div>
    );
  }

  return (
    <div className="vb-page">
      <p className="vb-muted" style={{ marginTop: 0, maxWidth: 640 }}>
        Immutable audit of admin actions: approvals, rejections, role changes, and directory updates.
      </p>

      {loading ? (
        <div className="vb-table-wrap">
          <table className="vb-table">
            <thead>
              <tr>
                {['When', 'Admin', 'Action', 'Entity', 'Details'].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 8 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={5}>
                    <div className="vb-skeleton" style={{ height: 20 }} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : rows.length === 0 ? (
        <EmptyState title="No activity yet" description="Admin actions will appear here." decor />
      ) : (
        <>
          <div className="vb-table-wrap">
            <table className="vb-table">
              <thead>
                <tr>
                  <th>When</th>
                  <th>Admin</th>
                  <th>Action</th>
                  <th>Entity</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((e) => (
                  <tr key={e.id}>
                    <td>{formatDateTime(e.createdAt)}</td>
                    <td>{e.adminEmail}</td>
                    <td>{activityActionLabel(e.action)}</td>
                    <td>
                      {e.entityType} #{e.entityId}
                      {e.entityType === 'BUSINESS_PROFILE' ? (
                        <>
                          {' '}
                          <Link to={`/business-profiles/${e.entityId}`} style={{ fontWeight: 600 }}>
                            View
                          </Link>
                        </>
                      ) : null}
                    </td>
                    <td className="vb-muted" style={{ fontSize: '0.8125rem', maxWidth: 280 }}>
                      {e.details ? (
                        <span title={e.details}>{e.details.length > 120 ? `${e.details.slice(0, 120)}…` : e.details}</span>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                ))}
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
