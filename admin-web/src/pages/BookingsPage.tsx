import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  cancelAdminBooking,
  completeAdminBooking,
  fetchAdminBookingsPage,
  fetchBusinessProfilesPage,
} from '@/api/adminApi';
import type { AdminBookingResponse, BookingStatus, BusinessProfileResponse } from '@/api/types';
import { useAdminChrome } from '@/components/layout/useAdminChrome';
import { BookingStatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/useToast';
import { getFriendlyErrorMessage } from '@/utils/apiError';

type Dialog = null | { type: 'cancel' | 'complete'; row: AdminBookingResponse };

const STATUS_OPTIONS: Array<BookingStatus | 'ALL'> = ['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];

export function BookingsPage() {
  const { headerSearch } = useAdminChrome();
  const { showToast } = useToast();
  const [rows, setRows] = useState<AdminBookingResponse[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<BookingStatus | 'ALL'>('ALL');
  const [businessId, setBusinessId] = useState<number | ''>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [businesses, setBusinesses] = useState<BusinessProfileResponse[]>([]);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const p = await fetchBusinessProfilesPage({ page: 0, size: 300, sort: 'businessName,asc' });
        setBusinesses(p.content);
      } catch {
        /* optional */
      }
    })();
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminBookingsPage({
        status: status === 'ALL' ? undefined : status,
        businessProfileId: businessId === '' ? undefined : businessId,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        search: headerSearch.trim() || undefined,
        page,
        size: 15,
        sort: 'createdAt,desc',
      });
      setRows(data.content);
      setTotalPages(data.totalPages);
    } catch (e) {
      setError(getFriendlyErrorMessage(e, 'Could not load bookings.'));
    } finally {
      setLoading(false);
    }
  }, [status, businessId, dateFrom, dateTo, headerSearch, page]);

  useEffect(() => {
    void load();
  }, [load]);

  async function runDialog() {
    if (!dialog) return;
    setBusy(true);
    try {
      if (dialog.type === 'cancel') {
        await cancelAdminBooking(dialog.row.id, 'Admin override');
        showToast('Booking cancelled.', 'success');
      } else {
        await completeAdminBooking(dialog.row.id);
        showToast('Marked completed.', 'success');
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
        <EmptyState title="Bookings unavailable" description={error} decor />
      </div>
    );
  }

  return (
    <div className="vb-page vb-animate-in">
      <div className="vb-toolbar">
        <div className="vb-toolbar__field">
          <label htmlFor="bk-status">Status</label>
          <select
            id="bk-status"
            className="vb-input"
            value={status}
            onChange={(e) => {
              setPage(0);
              setStatus(e.target.value as BookingStatus | 'ALL');
            }}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>
        <div className="vb-toolbar__field">
          <label htmlFor="bk-biz">Business</label>
          <select
            id="bk-biz"
            className="vb-input"
            value={businessId === '' ? '' : String(businessId)}
            onChange={(e) => {
              setPage(0);
              setBusinessId(e.target.value === '' ? '' : Number(e.target.value));
            }}
          >
            <option value="">All</option>
            {businesses.map((b) => (
              <option key={b.id} value={b.id}>
                {b.businessName}
              </option>
            ))}
          </select>
        </div>
        <div className="vb-toolbar__field">
          <label htmlFor="bk-from">Event from</label>
          <input
            id="bk-from"
            type="date"
            className="vb-input"
            value={dateFrom}
            onChange={(e) => {
              setPage(0);
              setDateFrom(e.target.value);
            }}
          />
        </div>
        <div className="vb-toolbar__field">
          <label htmlFor="bk-to">Event to</label>
          <input
            id="bk-to"
            type="date"
            className="vb-input"
            value={dateTo}
            onChange={(e) => {
              setPage(0);
              setDateTo(e.target.value);
            }}
          />
        </div>
      </div>

      {loading ? (
        <div className="vb-table-wrap">
          <table className="vb-table">
            <thead>
              <tr>
                {['ID', 'User', 'Event', 'Business', 'Date', 'Status', 'Amount', 'Actions'].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 6 }).map((_, i) => (
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
        <EmptyState title="No bookings" description="Adjust filters or search." decor />
      ) : (
        <>
          <div className="vb-table-wrap">
            <table className="vb-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>User</th>
                  <th>Event</th>
                  <th>Business</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td>{r.id}</td>
                    <td>
                      <Link to={`/users?userId=${r.userId}`}>{r.userEmail}</Link>
                    </td>
                    <td>
                      <Link to={`/events/${r.eventId}`}>{r.eventTitle ?? '—'}</Link>
                    </td>
                    <td>{r.businessName ?? '—'}</td>
                    <td>{r.eventDate}</td>
                    <td>
                      <BookingStatusBadge status={r.status} />
                    </td>
                    <td>
                      {r.totalPriceJod} JOD
                    </td>
                    <td>
                      <div className="vb-table-actions">
                        <Link to={`/bookings/${r.id}`}>
                          <Button variant="secondary" size="sm">
                            View
                          </Button>
                        </Link>
                        {r.status !== 'CANCELLED' && r.status !== 'COMPLETED' ? (
                          <>
                            <Button variant="dangerOutline" size="sm" onClick={() => setDialog({ type: 'cancel', row: r })}>
                              Cancel
                            </Button>
                            <Button variant="primary" size="sm" onClick={() => setDialog({ type: 'complete', row: r })}>
                              Complete
                            </Button>
                          </>
                        ) : null}
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
        open={dialog?.type === 'cancel'}
        title="Cancel booking"
        message={`Cancel booking #${dialog?.type === 'cancel' ? dialog.row.id : ''}?`}
        confirmLabel="Cancel booking"
        danger
        loading={busy}
        onConfirm={() => void runDialog()}
        onCancel={() => setDialog(null)}
      />
      <ConfirmDialog
        open={dialog?.type === 'complete'}
        title="Complete booking"
        message={`Mark booking #${dialog?.type === 'complete' ? dialog.row.id : ''} as completed?`}
        confirmLabel="Mark completed"
        loading={busy}
        onConfirm={() => void runDialog()}
        onCancel={() => setDialog(null)}
      />
    </div>
  );
}
