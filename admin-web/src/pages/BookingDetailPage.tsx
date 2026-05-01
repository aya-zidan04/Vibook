import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { cancelAdminBooking, completeAdminBooking, fetchAdminBooking } from '@/api/adminApi';
import type { AdminBookingResponse } from '@/api/types';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader } from '@/components/ui/Card';
import { BookingStatusBadge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/useToast';
import { getFriendlyErrorMessage } from '@/utils/apiError';
import { formatDateTime } from '@/utils/format';

export function BookingDetailPage() {
  const { id: idParam } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const id = idParam ? Number(idParam) : NaN;
  const valid = Number.isFinite(id);

  const [row, setRow] = useState<AdminBookingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialog, setDialog] = useState<null | 'cancel' | 'complete'>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!valid) return;
    let c = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const b = await fetchAdminBooking(id);
        if (!c) setRow(b);
      } catch (e) {
        if (!c) setError(getFriendlyErrorMessage(e, 'Could not load booking.'));
      } finally {
        if (!c) setLoading(false);
      }
    })();
    return () => {
      c = true;
    };
  }, [id, valid]);

  async function run() {
    if (!dialog || !valid) return;
    setBusy(true);
    try {
      if (dialog === 'cancel') {
        const b = await cancelAdminBooking(id, 'Admin override');
        setRow(b);
        showToast('Booking cancelled.', 'success');
      } else {
        const b = await completeAdminBooking(id);
        setRow(b);
        showToast('Marked completed.', 'success');
      }
      setDialog(null);
    } catch (e) {
      showToast(getFriendlyErrorMessage(e, 'Action failed.'), 'error');
    } finally {
      setBusy(false);
    }
  }

  if (!valid) {
    return (
      <div className="vb-page">
        <EmptyState title="Invalid booking" description="Check the URL." decor />
      </div>
    );
  }

  if (loading && !row) {
    return (
      <div className="vb-page">
        <div className="vb-skeleton" style={{ height: 160 }} />
      </div>
    );
  }

  if (error || !row) {
    return (
      <div className="vb-page">
        <EmptyState title="Booking unavailable" description={error ?? 'Not found.'} decor />
        <Link to="/bookings">← Back</Link>
      </div>
    );
  }

  return (
    <div className="vb-page vb-animate-in">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>
        ← Back
      </Button>
      <h1 style={{ marginTop: 0 }}>Booking #{row.id}</h1>
      <div style={{ marginBottom: 16 }}>
        <BookingStatusBadge status={row.status} />
      </div>

      {row.status !== 'CANCELLED' && row.status !== 'COMPLETED' ? (
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          <Button variant="dangerOutline" onClick={() => setDialog('cancel')}>
            Cancel (admin)
          </Button>
          <Button variant="primary" onClick={() => setDialog('complete')}>
            Mark completed
          </Button>
        </div>
      ) : null}

      <div className="vb-detail-sections">
        <Card padding="lg">
          <CardHeader title="Guest & event" />
          <dl className="vb-dl">
            <dt>User</dt>
            <dd>
              <Link to={`/users?userId=${row.userId}`}>{row.userEmail}</Link>
            </dd>
            <dt>Event</dt>
            <dd>
              <Link to={`/events/${row.eventId}`}>{row.eventTitle ?? '—'}</Link>
            </dd>
            <dt>Business</dt>
            <dd>{row.businessName ?? '—'}</dd>
            <dt>Event date</dt>
            <dd>{row.eventDate}</dd>
            <dt>Time slot</dt>
            <dd>{row.timeSlotLabel ?? '—'}</dd>
            <dt>Guests</dt>
            <dd>{row.guestsCount}</dd>
          </dl>
        </Card>
        <Card padding="lg">
          <CardHeader title="Payment & notes" />
          <dl className="vb-dl">
            <dt>Total</dt>
            <dd>{row.totalPriceJod} JOD</dd>
            <dt>Note</dt>
            <dd>{row.note ?? '—'}</dd>
            <dt>Cancel reason</dt>
            <dd>{row.cancelReason ?? '—'}</dd>
          </dl>
        </Card>
        <Card padding="lg">
          <CardHeader title="Status timeline" />
          <ul className="vb-timeline">
            <li>
              <span className="vb-timeline__dot" />
              <div className="vb-timeline__label">Created</div>
              <div className="vb-timeline__time">{formatDateTime(row.createdAt)}</div>
            </li>
            <li>
              <span className="vb-timeline__dot" />
              <div className="vb-timeline__label">Last updated</div>
              <div className="vb-timeline__time">{formatDateTime(row.updatedAt)}</div>
            </li>
            <li>
              <span className="vb-timeline__dot" />
              <div className="vb-timeline__label">Current status</div>
              <div className="vb-timeline__time">
                <BookingStatusBadge status={row.status} />
              </div>
            </li>
          </ul>
        </Card>
      </div>

      <ConfirmDialog
        open={dialog === 'cancel'}
        title="Cancel booking"
        message="Cancel this booking as admin?"
        confirmLabel="Cancel"
        danger
        loading={busy}
        onConfirm={() => void run()}
        onCancel={() => setDialog(null)}
      />
      <ConfirmDialog
        open={dialog === 'complete'}
        title="Complete booking"
        message="Mark this booking completed?"
        confirmLabel="Complete"
        loading={busy}
        onConfirm={() => void run()}
        onCancel={() => setDialog(null)}
      />
    </div>
  );
}
