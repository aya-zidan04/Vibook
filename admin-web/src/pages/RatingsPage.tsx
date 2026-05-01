import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteAdminRating, fetchAdminRatingsPage, setAdminRatingHidden } from '@/api/adminApi';
import type { AdminEventRatingResponse } from '@/api/types';
import { useAdminChrome } from '@/components/layout/useAdminChrome';
import { Button } from '@/components/ui/Button';
import { RoleBadge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/useToast';
import { getFriendlyErrorMessage } from '@/utils/apiError';
import { formatDateTime } from '@/utils/format';

export function RatingsPage() {
  const { headerSearch } = useAdminChrome();
  const { showToast } = useToast();
  const [rows, setRows] = useState<AdminEventRatingResponse[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [minStars, setMinStars] = useState<number | ''>('');
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminRatingsPage({
        minRating: minStars === '' ? undefined : minStars,
        flaggedOnly: flaggedOnly || undefined,
        search: headerSearch.trim() || undefined,
        page,
        size: 20,
        sort: 'createdAt,desc',
      });
      setRows(data.content);
      setTotalPages(data.totalPages);
    } catch (e) {
      setError(getFriendlyErrorMessage(e, 'Could not load ratings.'));
    } finally {
      setLoading(false);
    }
  }, [minStars, flaggedOnly, headerSearch, page]);

  useEffect(() => {
    void load();
  }, [load]);

  async function confirmDelete() {
    if (deleteId == null) return;
    setBusy(true);
    try {
      await deleteAdminRating(deleteId);
      showToast('Rating removed.', 'success');
      setDeleteId(null);
      await load();
    } catch (e) {
      showToast(getFriendlyErrorMessage(e, 'Delete failed.'), 'error');
    } finally {
      setBusy(false);
    }
  }

  async function toggleHide(r: AdminEventRatingResponse) {
    setBusy(true);
    try {
      await setAdminRatingHidden(r.id, !r.moderationHidden);
      showToast(r.moderationHidden ? 'Rating visible in aggregates again.' : 'Rating hidden from aggregates.', 'success');
      await load();
    } catch (e) {
      showToast(getFriendlyErrorMessage(e, 'Update failed.'), 'error');
    } finally {
      setBusy(false);
    }
  }

  if (error) {
    return (
      <div className="vb-page">
        <EmptyState title="Ratings unavailable" description={error} decor />
      </div>
    );
  }

  return (
    <div className="vb-page vb-animate-in">
      <p className="vb-muted" style={{ marginTop: 0 }}>
        Event star ratings only — the API does not store review comments yet.
      </p>
      <div className="vb-toolbar">
        <div className="vb-toolbar__field">
          <label htmlFor="rt-min">Min stars</label>
          <select
            id="rt-min"
            className="vb-input"
            value={minStars === '' ? '' : String(minStars)}
            onChange={(e) => {
              setPage(0);
              setMinStars(e.target.value === '' ? '' : Number(e.target.value));
            }}
          >
            <option value="">Any</option>
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {n}+
              </option>
            ))}
          </select>
        </div>
        <label className="vb-toolbar__field" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <input
            type="checkbox"
            checked={flaggedOnly}
            onChange={(e) => {
              setPage(0);
              setFlaggedOnly(e.target.checked);
            }}
          />
          <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Flagged only</span>
        </label>
      </div>

      {loading ? (
        <div className="vb-table-wrap">
          <table className="vb-table">
            <thead>
              <tr>
                {['User', 'Event', 'Business', 'Stars', 'Flags', 'Created', 'Actions'].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={7}>
                    <div className="vb-skeleton" style={{ height: 20 }} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : rows.length === 0 ? (
        <EmptyState title="No ratings" description="Nothing matches your filters." decor />
      ) : (
        <>
          <div className="vb-table-wrap">
            <table className="vb-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Event / business</th>
                  <th>Stars</th>
                  <th>Moderation</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <Link to={`/users?userId=${r.userId}`}>{r.userEmail}</Link>
                    </td>
                    <td>
                      <Link to={`/events/${r.eventId}`}>{r.eventTitle ?? 'Event'}</Link>
                      <div className="vb-muted" style={{ fontSize: '0.8125rem' }}>
                        {r.businessName}
                      </div>
                    </td>
                    <td>{r.ratingValue} ★</td>
                    <td>
                      {r.moderationHidden ? <RoleBadge label="Hidden" /> : null}
                      {r.flagged ? <RoleBadge label="Flagged" /> : null}
                      {!r.moderationHidden && !r.flagged ? <span className="vb-muted">—</span> : null}
                    </td>
                    <td>{formatDateTime(r.createdAt)}</td>
                    <td>
                      <div className="vb-table-actions">
                        <Button variant="secondary" size="sm" disabled={busy} onClick={() => void toggleHide(r)}>
                          {r.moderationHidden ? 'Unhide' : 'Hide'}
                        </Button>
                        <Button variant="dangerOutline" size="sm" onClick={() => setDeleteId(r.id)}>
                          Delete
                        </Button>
                      </div>
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

      <ConfirmDialog
        open={deleteId != null}
        title="Delete rating"
        message="Remove this rating and recalculate the event average?"
        confirmLabel="Delete"
        danger
        loading={busy}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
