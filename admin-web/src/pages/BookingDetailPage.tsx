import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { fetchAdminBooking } from '@/api/adminApi';
import type { AdminBookingPaymentInfo, AdminBookingResponse } from '@/api/types';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader } from '@/components/ui/Card';
import { BookingStatusBadge, PaymentStatusBadge } from '@/components/ui/Badge';
import { formatPaymentAmount } from '@/utils/bookingPayment';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAdminI18n } from '@/i18n/useAdminI18n';
import { getFriendlyErrorMessage } from '@/utils/apiError';
import { formatDateTime } from '@/utils/format';

export function BookingDetailPage() {
  const { t } = useAdminI18n();
  const { id: idParam } = useParams();
  const navigate = useNavigate();
  const id = idParam ? Number(idParam) : NaN;
  const valid = Number.isFinite(id);

  const [row, setRow] = useState<AdminBookingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
        if (!c) setError(getFriendlyErrorMessage(e, t('bookingDetail.loadError')));
      } finally {
        if (!c) setLoading(false);
      }
    })();
    return () => {
      c = true;
    };
  }, [id, valid, t]);

  if (!valid) {
    return (
      <div className="vb-page">
        <EmptyState title={t('bookingDetail.invalid')} description={t('bookingDetail.invalidDesc')} decor />
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
        <EmptyState
          title={t('bookingDetail.unavailable')}
          description={error ?? t('bookingDetail.notFound')}
          decor
        />
        <Link to="/bookings">{t('bookingDetail.back')}</Link>
      </div>
    );
  }

  return (
    <div className="vb-page vb-animate-in">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>
        {t('bookingDetail.back')}
      </Button>
      <h1 style={{ marginTop: 0 }}>{t('bookingDetail.title', { id: row.id })}</h1>

      <Card padding="lg" style={{ marginBottom: 24 }}>
        <CardHeader title={t('bookingDetail.paypalPayment')} />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', marginBottom: 12 }}>
          <div>
            <div className="vb-label-muted" style={{ marginBottom: 4 }}>
              {t('bookingDetail.bookingStatusLabel')}
            </div>
            <BookingStatusBadge status={row.status} />
          </div>
          <div>
            <div className="vb-label-muted" style={{ marginBottom: 4 }}>
              {t('bookingDetail.paymentStatusLabel')}
            </div>
            {row.payment ? (
              <PaymentStatusBadge status={row.payment.paymentStatus} />
            ) : (
              <span className="vb-badge vb-badge--neutral">{t('paymentStatus.none')}</span>
            )}
          </div>
        </div>
        <p
          style={{
            margin: 0,
            fontSize: 14,
            color: row.payment?.confirmedByPayPalCapture
              ? 'var(--vb-success)'
              : 'var(--vb-text-secondary)',
          }}
        >
          {row.payment?.confirmedByPayPalCapture
            ? t('bookingDetail.confirmedByPayPal')
            : t('bookingDetail.notConfirmedByPayPal')}
        </p>
      </Card>

      <div className="vb-detail-sections">
        <Card padding="lg">
          <CardHeader title={t('bookingDetail.guestEvent')} />
          <dl className="vb-dl">
            <dt>{t('bookingDetail.user')}</dt>
            <dd>
              <Link to={`/users?userId=${row.userId}`}>{row.userEmail}</Link>
            </dd>
            <dt>{t('bookingDetail.event')}</dt>
            <dd>
              <Link to={`/events/${row.eventId}`}>{row.eventTitle ?? t('common.dash')}</Link>
            </dd>
            <dt>{t('bookingDetail.business')}</dt>
            <dd>{row.businessName ?? t('common.dash')}</dd>
            <dt>{t('bookingDetail.eventDate')}</dt>
            <dd>{row.eventDate}</dd>
            <dt>{t('bookingDetail.timeSlot')}</dt>
            <dd>{row.timeSlotLabel ?? t('common.dash')}</dd>
            <dt>{t('bookingDetail.guests')}</dt>
            <dd>{row.guestsCount}</dd>
          </dl>
        </Card>
        <Card padding="lg">
          <CardHeader title={t('bookingDetail.paymentNotes')} />
          <dl className="vb-dl">
            <dt>{t('bookingDetail.total')}</dt>
            <dd>{t('bookingDetail.totalJod', { amount: row.totalPriceJod })}</dd>
            {row.payment ? (
              <PaymentFields payment={row.payment} />
            ) : (
              <>
                <dt>{t('bookingDetail.paypalPayment')}</dt>
                <dd>{t('bookingDetail.noPaymentRecorded')}</dd>
              </>
            )}
            <dt>{t('bookingDetail.note')}</dt>
            <dd>{row.note ?? t('common.dash')}</dd>
            <dt>{t('bookingDetail.cancelReason')}</dt>
            <dd>{row.cancelReason ?? t('common.dash')}</dd>
          </dl>
        </Card>
        <Card padding="lg">
          <CardHeader title={t('bookingDetail.statusTimeline')} />
          <ul className="vb-timeline">
            <li>
              <span className="vb-timeline__dot" />
              <div className="vb-timeline__label">{t('bookingDetail.created')}</div>
              <div className="vb-timeline__time">{formatDateTime(row.createdAt)}</div>
            </li>
            <li>
              <span className="vb-timeline__dot" />
              <div className="vb-timeline__label">{t('bookingDetail.lastUpdated')}</div>
              <div className="vb-timeline__time">{formatDateTime(row.updatedAt)}</div>
            </li>
            <li>
              <span className="vb-timeline__dot" />
              <div className="vb-timeline__label">{t('bookingDetail.currentStatus')}</div>
              <div className="vb-timeline__time">
                <BookingStatusBadge status={row.status} />
              </div>
            </li>
          </ul>
        </Card>
      </div>

    </div>
  );
}

function PaymentFields({ payment }: { payment: AdminBookingPaymentInfo }) {
  const { t } = useAdminI18n();
  return (
    <>
      <dt>{t('bookingDetail.paymentProvider')}</dt>
      <dd>{t('paymentProvider.paypal')}</dd>
      <dt>{t('bookingDetail.paymentStatusLabel')}</dt>
      <dd>
        <PaymentStatusBadge status={payment.paymentStatus} />
      </dd>
      <dt>{t('bookingDetail.paymentAmount')}</dt>
      <dd>{formatPaymentAmount(payment)}</dd>
      <dt>{t('bookingDetail.paypalOrderId')}</dt>
      <dd>{payment.paypalOrderId ?? t('common.dash')}</dd>
      <dt>{t('bookingDetail.paypalCaptureId')}</dt>
      <dd>{payment.paypalCaptureId ?? t('common.dash')}</dd>
    </>
  );
}
