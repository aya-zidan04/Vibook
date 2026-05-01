import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  approveBusinessProfile,
  fetchActivityLog,
  fetchBusinessProfile,
  rejectBusinessProfile,
  updateBusinessProfileNotes,
} from '@/api/adminApi';
import { resolveMediaUrl } from '@/api/mediaUrl';
import type { AdminActivityLogResponse, BusinessProfileResponse } from '@/api/types';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/useToast';
import { getFriendlyErrorMessage } from '@/utils/apiError';
import { formatDateTime } from '@/utils/format';

type Dialog = null | 'approve' | 'reject';

function parseRejectReasonFromLog(details: string | null): string | null {
  if (!details) return null;
  try {
    const o = JSON.parse(details) as { reason?: string };
    const r = o.reason?.trim();
    return r || null;
  } catch {
    return null;
  }
}

export function BusinessProfileDetailPage() {
  const { id: idParam } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const numericId = idParam ? Number(idParam) : NaN;
  const idValid = Number.isFinite(numericId);

  const [profile, setProfile] = useState<BusinessProfileResponse | null>(null);
  const [rejectHistory, setRejectHistory] = useState<AdminActivityLogResponse[]>([]);
  const [notesDraft, setNotesDraft] = useState('');
  const [notesSaving, setNotesSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    if (!idValid) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [data, logPage] = await Promise.all([
          fetchBusinessProfile(numericId),
          fetchActivityLog({ page: 0, size: 80, entityType: 'BUSINESS_PROFILE', entityId: numericId }),
        ]);
        if (cancelled) return;
        setProfile(data);
        setNotesDraft(data.adminNotes ?? '');
        const rejects = logPage.content.filter((e) => e.action === 'REJECT_BUSINESS_PROFILE');
        setRejectHistory(rejects);
      } catch (e) {
        if (!cancelled) {
          setError(getFriendlyErrorMessage(e, 'Could not load this profile.'));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [numericId, idValid]);

  async function saveNotes() {
    if (!profile) return;
    setNotesSaving(true);
    try {
      const updated = await updateBusinessProfileNotes(profile.id, notesDraft);
      setProfile(updated);
      showToast('Admin notes saved.', 'success');
    } catch (e) {
      showToast(getFriendlyErrorMessage(e, 'Could not save notes.'), 'error');
    } finally {
      setNotesSaving(false);
    }
  }

  async function runApprove() {
    if (!profile) return;
    setBusy(true);
    try {
      const updated = await approveBusinessProfile(profile.id);
      setProfile(updated);
      showToast('Profile approved.', 'success');
      setDialog(null);
    } catch (e) {
      showToast(getFriendlyErrorMessage(e, 'Approve failed.'), 'error');
    } finally {
      setBusy(false);
    }
  }

  async function runReject() {
    if (!profile) return;
    setBusy(true);
    try {
      const updated = await rejectBusinessProfile(profile.id, rejectReason.trim() || undefined);
      setProfile(updated);
      showToast('Profile rejected.', 'success');
      setDialog(null);
      setRejectReason('');
      const logPage = await fetchActivityLog({
        page: 0,
        size: 80,
        entityType: 'BUSINESS_PROFILE',
        entityId: profile.id,
      });
      setRejectHistory(logPage.content.filter((e) => e.action === 'REJECT_BUSINESS_PROFILE'));
    } catch (e) {
      showToast(getFriendlyErrorMessage(e, 'Reject failed.'), 'error');
    } finally {
      setBusy(false);
    }
  }

  if (!idValid) {
    return (
      <div className="vb-page">
        <EmptyState title="Invalid profile" description="The link may be broken." decor />
        <Link to="/business-profiles">← Back to list</Link>
      </div>
    );
  }

  if (loading && !profile) {
    return (
      <div className="vb-page">
        <div className="vb-detail-hero vb-skeleton" style={{ height: 220 }} />
        <div className="vb-detail-head">
          <div className="vb-skeleton vb-detail-logo" />
          <div style={{ flex: 1 }}>
            <div className="vb-skeleton" style={{ height: 32, width: '40%', marginBottom: 12 }} />
            <div className="vb-skeleton" style={{ height: 20, width: 120 }} />
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="vb-page">
        <EmptyState title="Profile unavailable" description={error ?? 'Not found.'} decor />
        <Link to="/business-profiles">← Back to list</Link>
      </div>
    );
  }

  const logoSrc = resolveMediaUrl(profile.logoImageUrl);
  const bannerSrc = resolveMediaUrl(profile.bannerImageUrl);

  const timelineItems: { label: string; at: string | null | undefined }[] = [
    { label: 'Created', at: profile.createdAt },
    { label: 'Last updated', at: profile.updatedAt },
    { label: 'Approved', at: profile.approvedAt },
    { label: 'Rejected', at: profile.rejectedAt },
  ].filter((t) => t.at);

  return (
    <div className="vb-page">
      <div style={{ marginBottom: 'var(--vb-space-lg)' }}>
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          ← Back
        </Button>
      </div>

      {bannerSrc ? (
        <div className="vb-detail-hero vb-animate-in">
          <img src={bannerSrc} alt="" />
        </div>
      ) : null}

      <div className="vb-detail-head vb-animate-in">
        {logoSrc ? (
          <div className="vb-detail-logo">
            <img src={logoSrc} alt="" />
          </div>
        ) : (
          <div
            className="vb-detail-logo vb-muted"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            No logo
          </div>
        )}
        <div className="vb-detail-title">
          <h1>{profile.businessName}</h1>
          {profile.tagline ? <p className="vb-muted">{profile.tagline}</p> : null}
          <div style={{ marginTop: 'var(--vb-space-md)' }}>
            <StatusBadge status={profile.status} />
          </div>
          {profile.status === 'PENDING_REVIEW' ? (
            <div style={{ display: 'flex', gap: 'var(--vb-space-sm)', marginTop: 'var(--vb-space-lg)' }}>
              <Button variant="primary" onClick={() => setDialog('approve')}>
                Approve
              </Button>
              <Button
                variant="dangerOutline"
                onClick={() => {
                  setRejectReason('');
                  setDialog('reject');
                }}
              >
                Reject
              </Button>
            </div>
          ) : null}
        </div>
      </div>

      {profile.rejectionReason ? (
        <Card
          padding="md"
          style={{
            marginBottom: 'var(--vb-space-xl)',
            background: 'rgba(163, 90, 64, 0.08)',
            borderColor: 'rgba(163, 90, 64, 0.25)',
          }}
        >
          <strong>Current rejection note:</strong> {profile.rejectionReason}
        </Card>
      ) : null}

      <div className="vb-detail-sections">
        <Card padding="lg">
          <CardHeader title="Timeline" subtitle="Key lifecycle timestamps for this profile." />
          <ul className="vb-timeline">
            {timelineItems.map((t) => (
              <li key={t.label}>
                <span className="vb-timeline__dot" />
                <div className="vb-timeline__label">{t.label}</div>
                <div className="vb-timeline__time">{t.at ? formatDateTime(t.at) : '—'}</div>
              </li>
            ))}
          </ul>
        </Card>

        <Card padding="lg">
          <CardHeader title="Admin notes" subtitle="Internal-only context for your team." />
          <label className="vb-field__label" htmlFor="admin-notes">
            Notes
          </label>
          <textarea
            id="admin-notes"
            className="vb-modal__textarea"
            value={notesDraft}
            onChange={(e) => setNotesDraft(e.target.value)}
            placeholder="e.g. Followed up by phone, waiting on license upload…"
            maxLength={4000}
          />
          <Button variant="primary" size="sm" disabled={notesSaving} onClick={() => void saveNotes()}>
            {notesSaving ? 'Saving…' : 'Save notes'}
          </Button>
        </Card>

        <Card padding="lg">
          <CardHeader title="Rejection history" subtitle="Recorded when admins rejected this profile." />
          {rejectHistory.length === 0 ? (
            <p className="vb-muted" style={{ margin: 0 }}>
              No rejection events logged for this profile.
            </p>
          ) : (
            <ul className="vb-timeline">
              {rejectHistory.map((e) => (
                <li key={e.id}>
                  <span className="vb-timeline__dot" />
                  <div className="vb-timeline__label">
                    {formatDateTime(e.createdAt)} · {e.adminEmail}
                  </div>
                  <div className="vb-timeline__time">
                    {parseRejectReasonFromLog(e.details) ?? (
                      <span className="vb-muted">No reason captured</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card padding="lg">
          <CardHeader title="Basic information" subtitle="How this business presents itself." />
          <dl className="vb-dl">
            <dt>Description</dt>
            <dd>{profile.description ?? '—'}</dd>
            <dt>Website</dt>
            <dd>
              {profile.website ? (
                <a href={profile.website} target="_blank" rel="noreferrer">
                  {profile.website}
                </a>
              ) : (
                '—'
              )}
            </dd>
            <dt>Google Maps</dt>
            <dd>
              {profile.googleMapsUrl ? (
                <a href={profile.googleMapsUrl} target="_blank" rel="noreferrer">
                  Open map
                </a>
              ) : (
                '—'
              )}
            </dd>
          </dl>
        </Card>

        <Card padding="lg">
          <CardHeader title="Contact" subtitle="How customers reach this business." />
          <dl className="vb-dl">
            <dt>Phone</dt>
            <dd>{profile.phone ?? '—'}</dd>
            <dt>Work email</dt>
            <dd>{profile.workEmail ?? '—'}</dd>
          </dl>
        </Card>

        <Card padding="lg">
          <CardHeader title="Category & location" />
          <dl className="vb-dl">
            <dt>Category</dt>
            <dd>{profile.primaryCategoryName ?? '—'}</dd>
            <dt>Governorate</dt>
            <dd>{profile.governorateName ?? '—'}</dd>
          </dl>
        </Card>

        <Card padding="lg">
          <CardHeader title="Owner" subtitle="Linked Vibook account." />
          <dl className="vb-dl">
            <dt>Account email</dt>
            <dd>{profile.ownerEmail ?? '—'}</dd>
            {profile.ownerUserId != null ? (
              <>
                <dt>Owner profile</dt>
                <dd>
                  <Link to={`/users?userId=${profile.ownerUserId}`}>Open in Users</Link>
                </dd>
              </>
            ) : null}
          </dl>
        </Card>
      </div>

      <ConfirmDialog
        open={dialog === 'approve'}
        title="Approve this profile?"
        message={`Approve “${profile.businessName}”? The business will be marked approved in Vibook.`}
        confirmLabel="Approve"
        onConfirm={() => void runApprove()}
        onCancel={() => setDialog(null)}
        loading={busy}
      />

      <ConfirmDialog
        open={dialog === 'reject'}
        title="Reject this profile?"
        message="The owner will see a rejected status. You can include a short reason below."
        confirmLabel="Reject profile"
        onConfirm={() => void runReject()}
        onCancel={() => {
          setDialog(null);
          setRejectReason('');
        }}
        danger
        loading={busy}
      >
        <label className="vb-field__label" htmlFor="detail-reject-reason">
          Reason (optional)
        </label>
        <textarea
          id="detail-reject-reason"
          className="vb-modal__textarea"
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          maxLength={500}
        />
      </ConfirmDialog>
    </div>
  );
}
