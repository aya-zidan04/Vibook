import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  deleteAdminEvent,
  fetchAdminEventsPage,
  fetchAllGovernorates,
  fetchCategories,
  hideAdminEvent,
  showAdminEvent,
} from '@/api/adminApi';
import type { AdminEventRowResponse, CategoryResponse, GovernorateResponse } from '@/api/types';
import { useAdminChrome } from '@/components/layout/useAdminChrome';
import { EventVisibilityBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/useToast';
import { getFriendlyErrorMessage } from '@/utils/apiError';
import { formatDateTime } from '@/utils/format';

type Dialog = null | { type: 'delete' | 'hide' | 'show'; row: AdminEventRowResponse };

export function EventsPage() {
  const { headerSearch } = useAdminChrome();
  const { showToast } = useToast();
  const [rows, setRows] = useState<AdminEventRowResponse[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [governorateId, setGovernorateId] = useState<number | ''>('');
  const [visibility, setVisibility] = useState<string>('ALL');
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [governorates, setGovernorates] = useState<GovernorateResponse[]>([]);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const [cats, govs] = await Promise.all([fetchCategories(), fetchAllGovernorates()]);
        setCategories(cats.filter((c) => c.active));
        setGovernorates(govs);
      } catch {
        /* optional */
      }
    })();
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminEventsPage({
        categoryId: categoryId === '' ? undefined : categoryId,
        governorateId: governorateId === '' ? undefined : governorateId,
        visibility: visibility === 'ALL' ? undefined : visibility,
        search: headerSearch.trim() || undefined,
        page,
        size: 15,
        sort: 'createdAt,desc',
      });
      setRows(data.content);
      setTotalPages(data.totalPages);
    } catch (e) {
      setError(getFriendlyErrorMessage(e, 'Could not load events.'));
    } finally {
      setLoading(false);
    }
  }, [categoryId, governorateId, visibility, headerSearch, page]);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredRows = useMemo(() => rows, [rows]);

  async function runDialogAction() {
    if (!dialog) return;
    setBusy(true);
    try {
      if (dialog.type === 'delete') {
        await deleteAdminEvent(dialog.row.id);
        showToast('Event deleted.', 'success');
      } else if (dialog.type === 'hide') {
        await hideAdminEvent(dialog.row.id);
        showToast('Event hidden.', 'success');
      } else {
        await showAdminEvent(dialog.row.id);
        showToast('Event is visible again.', 'success');
      }
      setDialog(null);
      await load();
    } catch (e) {
      showToast(getFriendlyErrorMessage(e, 'Action failed.'), 'error');
    } finally {
      setBusy(false);
    }
  }

  if (error) {
    return (
      <div className="vb-page">
        <EmptyState title="Events unavailable" description={error} decor />
      </div>
    );
  }

  return (
    <div className="vb-page vb-animate-in">
      <p className="vb-muted" style={{ marginTop: 0 }}>
        Moderate listings across all businesses. Draft filter is reserved until a draft lifecycle exists in the API.
      </p>
      <div className="vb-toolbar">
        <div className="vb-toolbar__field">
          <label htmlFor="ev-cat">Category</label>
          <select
            id="ev-cat"
            className="vb-input"
            value={categoryId === '' ? '' : String(categoryId)}
            onChange={(e) => {
              setPage(0);
              setCategoryId(e.target.value === '' ? '' : Number(e.target.value));
            }}
          >
            <option value="">All</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="vb-toolbar__field">
          <label htmlFor="ev-gov">Governorate</label>
          <select
            id="ev-gov"
            className="vb-input"
            value={governorateId === '' ? '' : String(governorateId)}
            onChange={(e) => {
              setPage(0);
              setGovernorateId(e.target.value === '' ? '' : Number(e.target.value));
            }}
          >
            <option value="">All</option>
            {governorates.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>
        <div className="vb-toolbar__field">
          <label htmlFor="ev-vis">Visibility</label>
          <select
            id="ev-vis"
            className="vb-input"
            value={visibility}
            onChange={(e) => {
              setPage(0);
              setVisibility(e.target.value);
            }}
          >
            <option value="ALL">All</option>
            <option value="VISIBLE">Visible</option>
            <option value="HIDDEN">Hidden</option>
            <option value="DRAFT">Draft (no data yet)</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="vb-table-wrap">
          <table className="vb-table">
            <thead>
              <tr>
                {['Title', 'Business', 'Category', 'Gov.', 'Price', 'Cap.', 'Status', 'Created', 'Actions'].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={9}>
                    <div className="vb-skeleton" style={{ height: 20 }} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : filteredRows.length === 0 ? (
        <EmptyState
          title="No events"
          description={headerSearch.trim() ? 'Try clearing search or filters.' : 'No events match the current filters.'}
          decor
        />
      ) : (
        <>
          <div className="vb-table-wrap">
            <table className="vb-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Business</th>
                  <th>Category</th>
                  <th>Gov.</th>
                  <th>Price</th>
                  <th>Cap.</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <strong>{r.title ?? '—'}</strong>
                    </td>
                    <td>{r.businessName ?? '—'}</td>
                    <td>{r.categoryName ?? '—'}</td>
                    <td>{r.governorateName ?? '—'}</td>
                    <td>
                      {r.priceJod} {r.currency}
                    </td>
                    <td>{r.capacityGuests}</td>
                    <td>
                      <EventVisibilityBadge status={r.visibilityStatus} />
                    </td>
                    <td>{formatDateTime(r.createdAt)}</td>
                    <td>
                      <div className="vb-table-actions">
                        <Link to={`/events/${r.id}`}>
                          <Button variant="secondary" size="sm">
                            View
                          </Button>
                        </Link>
                        {r.visibilityStatus === 'HIDDEN' ? (
                          <Button variant="primary" size="sm" onClick={() => setDialog({ type: 'show', row: r })}>
                            Show
                          </Button>
                        ) : (
                          <Button variant="secondary" size="sm" onClick={() => setDialog({ type: 'hide', row: r })}>
                            Hide
                          </Button>
                        )}
                        <Button variant="dangerOutline" size="sm" onClick={() => setDialog({ type: 'delete', row: r })}>
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
        open={dialog?.type === 'delete'}
        title="Delete event"
        message={`Permanently delete “${dialog?.type === 'delete' ? dialog.row.title ?? 'event' : ''}”? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={() => void runDialogAction()}
        onCancel={() => setDialog(null)}
        danger
        loading={busy}
      />
      <ConfirmDialog
        open={dialog?.type === 'hide'}
        title="Hide event"
        message={`Hide “${dialog?.type === 'hide' ? dialog.row.title ?? 'event' : ''}” from consumers?`}
        confirmLabel="Hide"
        onConfirm={() => void runDialogAction()}
        onCancel={() => setDialog(null)}
        loading={busy}
      />
      <ConfirmDialog
        open={dialog?.type === 'show'}
        title="Show event"
        message={`Make “${dialog?.type === 'show' ? dialog.row.title ?? 'event' : ''}” visible again?`}
        confirmLabel="Show"
        onConfirm={() => void runDialogAction()}
        onCancel={() => setDialog(null)}
        loading={busy}
      />
    </div>
  );
}
