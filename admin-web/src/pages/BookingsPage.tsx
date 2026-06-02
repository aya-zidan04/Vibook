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
import { BookingStatusBadge, PaymentStatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/useToast';
import { useAdminI18n } from '@/i18n/useAdminI18n';
import { getFriendlyErrorMessage } from '@/utils/apiError';

type Dialog = null | { type: 'cancel' | 'complete'; row: AdminBookingResponse };

const STATUS_OPTIONS: Array<BookingStatus | 'ALL'> = ['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];

const STATUS_LABEL_KEY: Record<BookingStatus | 'ALL', string> = {
  ALL: 'filters.all',
  PENDING: 'bookingStatus.pending',
  CONFIRMED: 'bookingStatus.confirmed',
  COMPLETED: 'bookingStatus.completed',
  CANCELLED: 'bookingStatus.cancelled',
};

export function BookingsPage() {
  const { t } = useAdminI18n();
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
      setError(getFriendlyErrorMessage(e, t('bookings.loadError')));
    } finally {
      setLoading(false);
    }
  }, [status, businessId, dateFrom, dateTo, headerSearch, page, t]);

  useEffect(() => {
    void load();
  }, [load]);

  async function runDialog() {
    if (!dialog) return;
    setBusy(true);
    try {
      if (dialog.type === 'cancel') {
        await cancelAdminBooking(dialog.row.id, t('bookings.adminOverrideReason'));
        showToast(t('bookings.cancelledToast'), 'success');
      } else {
        await completeAdminBooking(dialog.row.id);
        showToast(t('bookings.completedToast'), 'success');
      }
      setDialog(null);
      await load();
    } catch (e) {
      showToast(getFriendlyErrorMessage(e, t('bookings.actionFailed')), 'error');
    } finally {
      setBusy(false);
    }
  }

  if (error) {
    return (
      <div className="vb-page">
        <EmptyState title={t('bookings.unavailable')} description={error} decor />
      </div>
    );
  }

  return (
    <div className="vb-page vb-animate-in">
      <div className="vb-toolbar">
        <div className="vb-toolbar__field">
          <label htmlFor="bk-status">{t('filters.status')}</label>
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
                {t(STATUS_LABEL_KEY[s])}
              </option>
            ))}
          </select>
        </div>
        <div className="vb-toolbar__field">
          <label htmlFor="bk-biz">{t('filters.business')}</label>
          <select
            id="bk-biz"
            className="vb-input"
            value={businessId === '' ? '' : String(businessId)}
            onChange={(e) => {
              setPage(0);
              setBusinessId(e.target.value === '' ? '' : Number(e.target.value));
            }}
          >
            <option value="">{t('filters.all')}</option>
            {businesses.map((b) => (
              <option key={b.id} value={b.id}>
                {b.businessName}
              </option>
            ))}
          </select>
        </div>
        <div className="vb-toolbar__field">
          <label htmlFor="bk-from">{t('filters.eventFrom')}</label>
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
          <label htmlFor="bk-to">{t('filters.eventTo')}</label>
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
                {[
                  t('table.id'),
                  t('table.user'),
                  t('table.event'),
                  t('table.business'),
                  t('eventDetail.date'),
                  t('table.status'),
                  t('table.payment'),
                  t('table.amount'),
                  t('table.actions'),
                ].map((h) => (
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
      ) : rows.length === 0 ? (
        <EmptyState title={t('bookings.noBookings')} description={t('bookings.noBookingsDesc')} decor />
      ) : (
        <>
          <div className="vb-table-wrap">
            <table className="vb-table">
              <thead>
                <tr>
                  <th>{t('table.id')}</th>
                  <th>{t('table.user')}</th>
                  <th>{t('table.event')}</th>
                  <th>{t('table.business')}</th>
                  <th>{t('eventDetail.date')}</th>
                  <th>{t('table.status')}</th>
                  <th>{t('table.payment')}</th>
                  <th>{t('table.amount')}</th>
                  <th>{t('table.actions')}</th>
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
                      <Link to={`/events/${r.eventId}`}>{r.eventTitle ?? t('common.dash')}</Link>
                    </td>
                    <td>{r.businessName ?? t('common.dash')}</td>
                    <td>{r.eventDate}</td>
                    <td>
                      <BookingStatusBadge status={r.status} />
                    </td>
                    <td>
                      {r.payment ? (
                        <PaymentStatusBadge status={r.payment.paymentStatus} />
                      ) : (
                        <span className="vb-badge vb-badge--neutral">{t('bookings.paymentNone')}</span>
                      )}
                    </td>
                    <td>{t('bookings.amountJod', { amount: r.totalPriceJod })}</td>
                    <td>
                      <div className="vb-table-actions">
                        <Link to={`/bookings/${r.id}`}>
                          <Button variant="secondary" size="sm">
                            {t('table.view')}
                          </Button>
                        </Link>
                        {r.status !== 'CANCELLED' && r.status !== 'COMPLETED' ? (
                          <>
                            <Button variant="dangerOutline" size="sm" onClick={() => setDialog({ type: 'cancel', row: r })}>
                              {t('bookings.cancelBtn')}
                            </Button>
                            <Button variant="primary" size="sm" onClick={() => setDialog({ type: 'complete', row: r })}>
                              {t('bookings.completeBtn')}
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
            <span>{t('common.pageOf', { n: page + 1, total: Math.max(1, totalPages) })}</span>
            <Button variant="secondary" size="sm" disabled={page <= 0} onClick={() => setPage((p) => p - 1)}>
              {t('common.previous')}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              {t('common.next')}
            </Button>
          </div>
        </>
      )}

      <ConfirmDialog
        open={dialog?.type === 'cancel'}
        title={t('bookings.cancelTitle')}
        message={t('bookings.cancelMsg', { id: dialog?.type === 'cancel' ? dialog.row.id : '' })}
        confirmLabel={t('bookings.cancelConfirm')}
        danger
        loading={busy}
        onConfirm={() => void runDialog()}
        onCancel={() => setDialog(null)}
      />
      <ConfirmDialog
        open={dialog?.type === 'complete'}
        title={t('bookings.completeTitle')}
        message={t('bookings.completeMsg', { id: dialog?.type === 'complete' ? dialog.row.id : '' })}
        confirmLabel={t('bookings.completeConfirm')}
        loading={busy}
        onConfirm={() => void runDialog()}
        onCancel={() => setDialog(null)}
      />
    </div>
  );
}
