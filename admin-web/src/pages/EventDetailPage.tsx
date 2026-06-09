import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  deleteAdminEvent,
  fetchAdminEventDetail,
  hideAdminEvent,
  showAdminEvent,
  updateAdminEventNotes,
} from '@/api/adminApi';
import { resolveMediaUrl } from '@/api/mediaUrl';
import type { AdminEventDetailPayload } from '@/api/types';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader } from '@/components/ui/Card';
import { EventVisibilityBadge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/useToast';
import { useAdminI18n } from '@/i18n/useAdminI18n';
import { getFriendlyErrorMessage } from '@/utils/apiError';
import { formatEventCategory } from '@/utils/eventLabels';
import { localizedGovernorateName } from '@/utils/governorateLabels';
import { formatDateTime, formatEventDate } from '@/utils/format';

type Dialog = null | 'delete' | 'hide' | 'show';

export function EventDetailPage() {
  const { t, locale } = useAdminI18n();
  const { id: idParam } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const id = idParam ? Number(idParam) : NaN;
  const valid = Number.isFinite(id);

  const [data, setData] = useState<AdminEventDetailPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [notesSaving, setNotesSaving] = useState(false);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!valid) return;
    let c = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const d = await fetchAdminEventDetail(id);
        if (!c) {
          setData(d);
          setNotes(d.adminNotes ?? '');
        }
      } catch (e) {
        if (!c) setError(getFriendlyErrorMessage(e, t('eventDetail.loadError')));
      } finally {
        if (!c) setLoading(false);
      }
    })();
    return () => {
      c = true;
    };
  }, [id, valid, t]);

  async function saveNotes() {
    if (!valid) return;
    setNotesSaving(true);
    try {
      await updateAdminEventNotes(id, notes);
      showToast(t('eventDetail.notesSaved'), 'success');
      const d = await fetchAdminEventDetail(id);
      setData(d);
    } catch (e) {
      showToast(getFriendlyErrorMessage(e, t('eventDetail.notesSaveFailed')), 'error');
    } finally {
      setNotesSaving(false);
    }
  }

  async function runAction() {
    if (!dialog || !data) return;
    setBusy(true);
    try {
      if (dialog === 'delete') {
        await deleteAdminEvent(id);
        showToast(t('eventDetail.deletedToast'), 'success');
        navigate('/events');
        return;
      }
      if (dialog === 'hide') {
        const ev = await hideAdminEvent(id);
        showToast(t('eventDetail.hiddenToast'), 'success');
        setData({ event: ev, adminNotes: data.adminNotes });
      } else {
        const ev = await showAdminEvent(id);
        showToast(t('eventDetail.shownToast'), 'success');
        setData({ event: ev, adminNotes: data.adminNotes });
      }
      setDialog(null);
    } catch (e) {
      showToast(getFriendlyErrorMessage(e, t('events.actionFailed')), 'error');
    } finally {
      setBusy(false);
    }
  }

  if (!valid) {
    return (
      <div className="vb-page">
        <EmptyState title={t('eventDetail.invalid')} description={t('eventDetail.invalidDesc')} decor />
      </div>
    );
  }

  if (loading && !data) {
    return (
      <div className="vb-page">
        <div className="vb-skeleton" style={{ height: 200 }} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="vb-page">
        <EmptyState
          title={t('eventDetail.unavailable')}
          description={error ?? t('eventDetail.notFound')}
          decor
        />
        <Link to="/events">{t('eventDetail.backToEvents')}</Link>
      </div>
    );
  }

  const ev = data.event;

  return (
    <div className="vb-page vb-animate-in">
      <div style={{ marginBottom: 'var(--vb-space-md)' }}>
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          {t('eventDetail.back')}
        </Button>
      </div>

      <div className="vb-detail-head">
        <div className="vb-detail-title" style={{ flex: 1 }}>
          <h1 style={{ marginBottom: 8 }}>{ev.title ?? t('eventDetail.untitled')}</h1>
          <EventVisibilityBadge status={ev.hidden ? 'HIDDEN' : 'VISIBLE'} />
          <p className="vb-muted" style={{ marginTop: 'var(--vb-space-md)' }}>
            {ev.businessProfileId ? (
              <Link to={`/business-profiles/${ev.businessProfileId}`}>
                {ev.businessName?.trim() ||
                  t('eventDetail.businessProfileLink', { id: ev.businessProfileId })}
              </Link>
            ) : null}
            {' · '}
            {formatEventCategory(ev.categoryName, ev.subcategoryName) ?? t('dashboard.categoryFallback')} ·{' '}
            {localizedGovernorateName(ev.governorateName, locale) || t('dashboard.governorateFallback')}
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 'var(--vb-space-lg)' }}>
            {ev.hidden ? (
              <Button variant="primary" onClick={() => setDialog('show')}>
                {t('eventDetail.showEvent')}
              </Button>
            ) : (
              <Button variant="secondary" onClick={() => setDialog('hide')}>
                {t('eventDetail.hideEvent')}
              </Button>
            )}
            <Button variant="danger" onClick={() => setDialog('delete')}>
              {t('eventDetail.delete')}
            </Button>
          </div>
        </div>
      </div>

      {ev.photoUrls?.length ? (
        <div
          className="vb-gallery vb-animate-in"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: 'var(--vb-space-md)',
            marginBottom: 'var(--vb-space-xl)',
          }}
        >
          {ev.photoUrls.map((url, i) => {
            const src = resolveMediaUrl(url);
            return src ? (
              <a key={i} href={src} target="_blank" rel="noreferrer">
                <img
                  src={src}
                  alt=""
                  style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 'var(--vb-radius-sm)' }}
                />
              </a>
            ) : null;
          })}
        </div>
      ) : null}

      <div className="vb-detail-sections">
        <Card padding="lg">
          <CardHeader title={t('eventDetail.ratingsSummary')} />
          <p style={{ margin: 0 }}>
            <strong>
              {t('eventDetail.ratingsAvg', {
                avg: ev.averageRating.toFixed(2),
                count: ev.reviewCount,
              })}
            </strong>
          </p>
        </Card>

        <Card padding="lg">
          <CardHeader title={t('eventDetail.schedule')} />
          <dl className="vb-dl">
            <dt>{t('eventDetail.date')}</dt>
            <dd>{formatEventDate(ev.eventDate)}</dd>
            <dt>{t('eventDetail.timeSlots')}</dt>
            <dd>{ev.timeSlots?.length ? ev.timeSlots.join(', ') : t('common.dash')}</dd>
            <dt>{t('eventDetail.price')}</dt>
            <dd>
              {ev.priceJod} {ev.currency}
            </dd>
            <dt>{t('eventDetail.capacity')}</dt>
            <dd>{t('eventDetail.guests', { count: ev.capacityGuests })}</dd>
            <dt>{t('eventDetail.remaining')}</dt>
            <dd>{t('eventDetail.guests', { count: ev.remainingCapacity ?? ev.capacityGuests })}</dd>
            <dt>{t('eventDetail.location')}</dt>
            <dd>
              {ev.googleMapsUrl ? (
                <a href={ev.googleMapsUrl} target="_blank" rel="noreferrer">
                  {t('eventDetail.openMap')}
                </a>
              ) : (
                t('common.dash')
              )}
            </dd>
            <dt>{t('eventDetail.photos')}</dt>
            <dd>{ev.photoUrls?.length ?? 0}</dd>
            <dt>{t('eventDetail.created')}</dt>
            <dd>{formatDateTime(ev.createdAt)}</dd>
            <dt>{t('eventDetail.updated')}</dt>
            <dd>{formatDateTime(ev.updatedAt)}</dd>
          </dl>
        </Card>

        <Card padding="lg">
          <CardHeader title={t('eventDetail.description')} />
          <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{ev.description ?? t('common.dash')}</p>
        </Card>

        <Card padding="lg">
          <CardHeader title={t('eventDetail.adminNotes')} subtitle={t('eventDetail.adminNotesSubtitle')} />
          <textarea className="vb-modal__textarea" value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} />
          <Button variant="primary" size="sm" disabled={notesSaving} onClick={() => void saveNotes()}>
            {notesSaving ? t('common.saving') : t('eventDetail.saveNotes')}
          </Button>
        </Card>
      </div>

      <ConfirmDialog
        open={dialog === 'delete'}
        title={t('eventDetail.deleteTitle')}
        message={t('eventDetail.deleteMsg')}
        confirmLabel={t('events.deleteConfirm')}
        danger
        loading={busy}
        onConfirm={() => void runAction()}
        onCancel={() => setDialog(null)}
      />
      <ConfirmDialog
        open={dialog === 'hide'}
        title={t('eventDetail.hideTitle')}
        message={t('eventDetail.hideMsg')}
        confirmLabel={t('events.hideConfirm')}
        loading={busy}
        onConfirm={() => void runAction()}
        onCancel={() => setDialog(null)}
      />
      <ConfirmDialog
        open={dialog === 'show'}
        title={t('eventDetail.showTitle')}
        message={t('eventDetail.showMsg')}
        confirmLabel={t('events.showConfirm')}
        loading={busy}
        onConfirm={() => void runAction()}
        onCancel={() => setDialog(null)}
      />
    </div>
  );
}
