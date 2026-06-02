import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  approveBusinessProfile,
  fetchBusinessProfile,
  rejectBusinessProfile,
  updateBusinessProfileNotes,
} from '@/api/adminApi';
import { resolveMediaUrl } from '@/api/mediaUrl';
import type { BusinessProfileResponse } from '@/api/types';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/useToast';
import { useAdminI18n } from '@/i18n/useAdminI18n';
import { getFriendlyErrorMessage } from '@/utils/apiError';
import { localizedGovernorateName } from '@/utils/governorateLabels';
import { formatDateTime } from '@/utils/format';

type Dialog = null | 'approve' | 'reject';

export function BusinessProfileDetailPage() {
  const { t, locale } = useAdminI18n();
  const { id: idParam } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const numericId = idParam ? Number(idParam) : NaN;
  const idValid = Number.isFinite(numericId);

  const [profile, setProfile] = useState<BusinessProfileResponse | null>(null);
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
        const data = await fetchBusinessProfile(numericId);
        if (cancelled) return;
        setProfile(data);
        setNotesDraft(data.adminNotes ?? '');
      } catch (e) {
        if (!cancelled) {
          setError(getFriendlyErrorMessage(e, t('businessProfileDetail.loadError')));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [numericId, idValid, t]);

  async function saveNotes() {
    if (!profile) return;
    setNotesSaving(true);
    try {
      const updated = await updateBusinessProfileNotes(profile.id, notesDraft);
      setProfile(updated);
      showToast(t('businessProfileDetail.notesSaved'), 'success');
    } catch (e) {
      showToast(getFriendlyErrorMessage(e, t('businessProfileDetail.notesSaveFailed')), 'error');
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
      showToast(t('businessProfileDetail.approvedToast'), 'success');
      setDialog(null);
    } catch (e) {
      showToast(getFriendlyErrorMessage(e, t('businessProfiles.approveFailed')), 'error');
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
      showToast(t('businessProfileDetail.rejectedToast'), 'success');
      setDialog(null);
      setRejectReason('');
    } catch (e) {
      showToast(getFriendlyErrorMessage(e, t('businessProfiles.rejectFailed')), 'error');
    } finally {
      setBusy(false);
    }
  }

  if (!idValid) {
    return (
      <div className="vb-page">
        <EmptyState title={t('businessProfileDetail.invalid')} description={t('businessProfileDetail.invalidDesc')} decor />
        <Link to="/business-profiles">{t('businessProfileDetail.backToList')}</Link>
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
        <EmptyState
          title={t('businessProfileDetail.unavailable')}
          description={error ?? t('businessProfileDetail.notFound')}
          decor
        />
        <Link to="/business-profiles">{t('businessProfileDetail.backToList')}</Link>
      </div>
    );
  }

  const logoSrc = resolveMediaUrl(profile.logoImageUrl);
  const bannerSrc = resolveMediaUrl(profile.bannerImageUrl);

  const timelineItems: { label: string; at: string | null | undefined }[] = [
    { label: t('businessProfileDetail.created'), at: profile.createdAt },
    { label: t('businessProfileDetail.lastUpdated'), at: profile.updatedAt },
    { label: t('businessProfileDetail.approved'), at: profile.approvedAt },
    { label: t('businessProfileDetail.rejected'), at: profile.rejectedAt },
  ].filter((item) => item.at);

  return (
    <div className="vb-page">
      <div style={{ marginBottom: 'var(--vb-space-lg)' }}>
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          {t('businessProfileDetail.back')}
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
            {t('businessProfileDetail.noLogo')}
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
                {t('businessProfileDetail.approve')}
              </Button>
              <Button
                variant="dangerOutline"
                onClick={() => {
                  setRejectReason('');
                  setDialog('reject');
                }}
              >
                {t('businessProfileDetail.reject')}
              </Button>
            </div>
          ) : null}
        </div>
      </div>

      {profile.rejectionReason ? (
        <Card padding="md" className="vb-callout vb-callout--warning">
          <strong>{t('businessProfileDetail.rejectionNote')}</strong> {profile.rejectionReason}
        </Card>
      ) : null}

      <div className="vb-detail-sections">
        <Card padding="lg">
          <CardHeader title={t('businessProfileDetail.timeline')} subtitle={t('businessProfileDetail.timelineSubtitle')} />
          <ul className="vb-timeline">
            {timelineItems.map((item) => (
              <li key={item.label}>
                <span className="vb-timeline__dot" />
                <div className="vb-timeline__label">{item.label}</div>
                <div className="vb-timeline__time">{item.at ? formatDateTime(item.at) : t('common.dash')}</div>
              </li>
            ))}
          </ul>
        </Card>

        <Card padding="lg">
          <CardHeader title={t('businessProfileDetail.adminNotes')} subtitle={t('businessProfileDetail.adminNotesSubtitle')} />
          <label className="vb-field__label" htmlFor="admin-notes">
            {t('businessProfileDetail.notes')}
          </label>
          <textarea
            id="admin-notes"
            className="vb-modal__textarea"
            value={notesDraft}
            onChange={(e) => setNotesDraft(e.target.value)}
            placeholder={t('businessProfileDetail.notesPlaceholder')}
            maxLength={4000}
          />
          <Button variant="primary" size="sm" disabled={notesSaving} onClick={() => void saveNotes()}>
            {notesSaving ? t('common.saving') : t('businessProfileDetail.saveNotes')}
          </Button>
        </Card>

        <Card padding="lg">
          <CardHeader title={t('businessProfileDetail.basicInfo')} subtitle={t('businessProfileDetail.basicInfoSubtitle')} />
          <dl className="vb-dl">
            <dt>{t('businessProfileDetail.description')}</dt>
            <dd>{profile.description ?? t('common.dash')}</dd>
            <dt>{t('businessProfileDetail.website')}</dt>
            <dd>
              {profile.website ? (
                <a href={profile.website} target="_blank" rel="noreferrer">
                  {profile.website}
                </a>
              ) : (
                t('common.dash')
              )}
            </dd>
            <dt>{t('businessProfileDetail.googleMaps')}</dt>
            <dd>
              {profile.googleMapsUrl ? (
                <a href={profile.googleMapsUrl} target="_blank" rel="noreferrer">
                  {t('businessProfileDetail.openMap')}
                </a>
              ) : (
                t('common.dash')
              )}
            </dd>
          </dl>
        </Card>

        <Card padding="lg">
          <CardHeader title={t('businessProfileDetail.contact')} subtitle={t('businessProfileDetail.contactSubtitle')} />
          <dl className="vb-dl">
            <dt>{t('table.phone')}</dt>
            <dd>{profile.phone ?? t('common.dash')}</dd>
            <dt>{t('table.workEmail')}</dt>
            <dd>{profile.workEmail ?? t('common.dash')}</dd>
          </dl>
        </Card>

        <Card padding="lg">
          <CardHeader title={t('businessProfileDetail.categoryLocation')} />
          <dl className="vb-dl">
            <dt>{t('table.category')}</dt>
            <dd>{profile.primaryCategoryName ?? t('common.dash')}</dd>
            <dt>{t('table.governorate')}</dt>
            <dd>{localizedGovernorateName(profile.governorateName, locale) || t('common.dash')}</dd>
          </dl>
        </Card>

        <Card padding="lg">
          <CardHeader title={t('businessProfileDetail.owner')} subtitle={t('businessProfileDetail.ownerSubtitle')} />
          <dl className="vb-dl">
            <dt>{t('businessProfileDetail.accountEmail')}</dt>
            <dd>{profile.ownerEmail ?? t('common.dash')}</dd>
            {profile.ownerUserId != null ? (
              <>
                <dt>{t('businessProfileDetail.ownerProfile')}</dt>
                <dd>
                  <Link to={`/users?userId=${profile.ownerUserId}`}>{t('businessProfileDetail.openInUsers')}</Link>
                </dd>
              </>
            ) : null}
          </dl>
        </Card>
      </div>

      <ConfirmDialog
        open={dialog === 'approve'}
        title={t('businessProfileDetail.approveTitle')}
        message={t('businessProfileDetail.approveMsg', { name: profile.businessName })}
        confirmLabel={t('businessProfileDetail.approve')}
        onConfirm={() => void runApprove()}
        onCancel={() => setDialog(null)}
        loading={busy}
      />

      <ConfirmDialog
        open={dialog === 'reject'}
        title={t('businessProfileDetail.rejectTitle')}
        message={t('businessProfileDetail.rejectMsg')}
        confirmLabel={t('businessProfiles.rejectConfirm')}
        onConfirm={() => void runReject()}
        onCancel={() => {
          setDialog(null);
          setRejectReason('');
        }}
        danger
        loading={busy}
      >
        <label className="vb-field__label" htmlFor="detail-reject-reason">
          {t('businessProfiles.reasonOptional')}
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
