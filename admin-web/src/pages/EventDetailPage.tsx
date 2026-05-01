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
import { getFriendlyErrorMessage } from '@/utils/apiError';
import { formatDateTime } from '@/utils/format';

type Dialog = null | 'delete' | 'hide' | 'show';

export function EventDetailPage() {
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
        if (!c) setError(getFriendlyErrorMessage(e, 'Could not load event.'));
      } finally {
        if (!c) setLoading(false);
      }
    })();
    return () => {
      c = true;
    };
  }, [id, valid]);

  async function saveNotes() {
    if (!valid) return;
    setNotesSaving(true);
    try {
      await updateAdminEventNotes(id, notes);
      showToast('Notes saved.', 'success');
      const d = await fetchAdminEventDetail(id);
      setData(d);
    } catch (e) {
      showToast(getFriendlyErrorMessage(e, 'Could not save notes.'), 'error');
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
        showToast('Event deleted.', 'success');
        navigate('/events');
        return;
      }
      if (dialog === 'hide') {
        const ev = await hideAdminEvent(id);
        showToast('Event hidden.', 'success');
        setData({ event: ev, adminNotes: data.adminNotes });
      } else {
        const ev = await showAdminEvent(id);
        showToast('Event shown.', 'success');
        setData({ event: ev, adminNotes: data.adminNotes });
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
        <EmptyState title="Invalid event" description="Check the URL." decor />
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
        <EmptyState title="Event unavailable" description={error ?? 'Not found.'} decor />
        <Link to="/events">← Back to events</Link>
      </div>
    );
  }

  const ev = data.event;

  return (
    <div className="vb-page vb-animate-in">
      <div style={{ marginBottom: 'var(--vb-space-md)' }}>
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          ← Back
        </Button>
      </div>

      <div className="vb-detail-head">
        <div className="vb-detail-title" style={{ flex: 1 }}>
          <h1 style={{ marginBottom: 8 }}>{ev.title ?? 'Untitled event'}</h1>
          <EventVisibilityBadge status={ev.hidden ? 'HIDDEN' : 'VISIBLE'} />
          <p className="vb-muted" style={{ marginTop: 'var(--vb-space-md)' }}>
            {ev.businessProfileId ? (
              <Link to={`/business-profiles/${ev.businessProfileId}`}>Business profile #{ev.businessProfileId}</Link>
            ) : null}
            {' · '}
            {ev.categoryName ?? 'Category'} · {ev.governorateName ?? 'Governorate'}
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 'var(--vb-space-lg)' }}>
            {ev.hidden ? (
              <Button variant="primary" onClick={() => setDialog('show')}>
                Show event
              </Button>
            ) : (
              <Button variant="secondary" onClick={() => setDialog('hide')}>
                Hide event
              </Button>
            )}
            <Button variant="dangerOutline" onClick={() => setDialog('delete')}>
              Delete
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
          <CardHeader title="Ratings summary" />
          <p style={{ margin: 0 }}>
            <strong>{ev.averageRating.toFixed(2)}</strong> avg · {ev.reviewCount} reviews
          </p>
        </Card>

        <Card padding="lg">
          <CardHeader title="Schedule & capacity" />
          <dl className="vb-dl">
            <dt>Date</dt>
            <dd>{ev.eventDate}</dd>
            <dt>Time slots</dt>
            <dd>{ev.timeSlots?.length ? ev.timeSlots.join(', ') : '—'}</dd>
            <dt>Price</dt>
            <dd>
              {ev.priceJod} {ev.currency}
            </dd>
            <dt>Capacity</dt>
            <dd>{ev.capacityGuests} guests</dd>
            <dt>Created</dt>
            <dd>{formatDateTime(ev.createdAt)}</dd>
            <dt>Updated</dt>
            <dd>{formatDateTime(ev.updatedAt)}</dd>
          </dl>
        </Card>

        <Card padding="lg">
          <CardHeader title="Description" />
          <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{ev.description ?? '—'}</p>
        </Card>

        <Card padding="lg">
          <CardHeader title="Admin notes" subtitle="Internal only." />
          <textarea className="vb-modal__textarea" value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} />
          <Button variant="primary" size="sm" disabled={notesSaving} onClick={() => void saveNotes()}>
            {notesSaving ? 'Saving…' : 'Save notes'}
          </Button>
        </Card>
      </div>

      <ConfirmDialog
        open={dialog === 'delete'}
        title="Delete event"
        message="Permanently delete this event?"
        confirmLabel="Delete"
        danger
        loading={busy}
        onConfirm={() => void runAction()}
        onCancel={() => setDialog(null)}
      />
      <ConfirmDialog
        open={dialog === 'hide'}
        title="Hide event"
        message="Hide this listing from consumers?"
        confirmLabel="Hide"
        loading={busy}
        onConfirm={() => void runAction()}
        onCancel={() => setDialog(null)}
      />
      <ConfirmDialog
        open={dialog === 'show'}
        title="Show event"
        message="Make this listing visible again?"
        confirmLabel="Show"
        loading={busy}
        onConfirm={() => void runAction()}
        onCancel={() => setDialog(null)}
      />
    </div>
  );
}
