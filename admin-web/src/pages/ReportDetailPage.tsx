import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  dismissAdminReport,
  fetchAdminReport,
  resolveAdminReport,
  reviewAdminReport,
} from '@/api/adminApi';
import type { AdminModerationReportResponse } from '@/api/types';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader } from '@/components/ui/Card';
import { ReportStatusBadge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/useToast';
import { useAdminI18n } from '@/i18n/useAdminI18n';
import { getFriendlyErrorMessage } from '@/utils/apiError';
import { formatDateTime } from '@/utils/format';
import { moderationReportTypeLabel } from '@/utils/moderationReportLabels';

function reportTargetHref(r: AdminModerationReportResponse): string | null {
  if (r.targetId == null) return null;
  switch (r.type) {
    case 'EVENT':
      return `/events/${r.targetId}`;
    case 'BOOKING':
      return `/bookings/${r.targetId}`;
    case 'USER':
      return `/users?userId=${r.targetId}`;
    case 'RATING':
      return '/ratings';
    case 'BUSINESS_PROFILE':
      return `/business-profiles/${r.targetId}`;
    case 'OTHER':
    default:
      return null;
  }
}

export function ReportDetailPage() {
  const { t } = useAdminI18n();
  const { id: idParam } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const id = idParam ? Number(idParam) : NaN;
  const valid = Number.isFinite(id);

  const [row, setRow] = useState<AdminModerationReportResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [confirmResolve, setConfirmResolve] = useState(false);
  const [confirmReview, setConfirmReview] = useState(false);
  const [confirmDismiss, setConfirmDismiss] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!valid) return;
    let c = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const r = await fetchAdminReport(id);
        if (!c) {
          setRow(r);
          setNotes(r.adminNotes ?? '');
        }
      } catch (e) {
        if (!c) setError(getFriendlyErrorMessage(e, t('moderationReportDetail.loadError')));
      } finally {
        if (!c) setLoading(false);
      }
    })();
    return () => {
      c = true;
    };
  }, [id, valid, t]);

  async function runResolve() {
    if (!valid) return;
    setBusy(true);
    try {
      const r = await resolveAdminReport(id, notes.trim() || null);
      setRow(r);
      showToast(t('moderationReportDetail.resolvedToast'), 'success');
      setConfirmResolve(false);
    } catch (e) {
      showToast(getFriendlyErrorMessage(e, t('moderationReportDetail.resolveFailed')), 'error');
    } finally {
      setBusy(false);
    }
  }

  async function runReview() {
    if (!valid) return;
    setBusy(true);
    try {
      const r = await reviewAdminReport(id, notes.trim() || null);
      setRow(r);
      showToast(t('moderationReportDetail.reviewedToast'), 'success');
      setConfirmReview(false);
    } catch (e) {
      showToast(getFriendlyErrorMessage(e, t('moderationReportDetail.updateFailed')), 'error');
    } finally {
      setBusy(false);
    }
  }

  async function runDismiss() {
    if (!valid) return;
    setBusy(true);
    try {
      const r = await dismissAdminReport(id, notes.trim() || null);
      setRow(r);
      showToast(t('moderationReportDetail.dismissedToast'), 'success');
      setConfirmDismiss(false);
    } catch (e) {
      showToast(getFriendlyErrorMessage(e, t('moderationReportDetail.dismissFailed')), 'error');
    } finally {
      setBusy(false);
    }
  }

  if (!valid) {
    return (
      <div className="vb-page">
        <EmptyState title={t('moderationReportDetail.invalid')} description={t('moderationReportDetail.invalidDesc')} decor />
      </div>
    );
  }

  if (loading && !row) {
    return (
      <div className="vb-page">
        <div className="vb-skeleton" style={{ height: 140 }} />
      </div>
    );
  }

  if (error || !row) {
    return (
      <div className="vb-page">
        <EmptyState title={t('moderationReportDetail.unavailable')} description={error ?? t('moderationReportDetail.notFound')} decor />
        <Link to="/reports">{t('common.back')}</Link>
      </div>
    );
  }

  const targetHref = reportTargetHref(row);
  const canAct = row.status === 'OPEN' || row.status === 'REVIEWED';

  return (
    <div className="vb-page vb-animate-in">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>
        {t('common.back')}
      </Button>
      <h1 style={{ marginTop: 0 }}>{t('moderationReportDetail.title', { id: row.id })}</h1>
      <div style={{ marginBottom: 16 }}>
        <ReportStatusBadge status={row.status} />
      </div>

      <div className="vb-detail-sections">
        <Card padding="lg">
          <CardHeader title={t('moderationReportDetail.summary')} />
          <dl className="vb-dl">
            <dt>{t('moderationReportDetail.reporter')}</dt>
            <dd>
              <Link to={`/users?userId=${row.reporterUserId}`}>{row.reporterEmail}</Link>
            </dd>
            <dt>{t('moderationReportDetail.type')}</dt>
            <dd>{moderationReportTypeLabel(row.type, t)}</dd>
            <dt>{t('moderationReportDetail.target')}</dt>
            <dd>
              {targetHref ? (
                <Link to={targetHref}>
                  {row.targetId != null
                    ? t('moderationReportDetail.openRelated', { id: row.targetId })
                    : t('moderationReportDetail.openRelatedView')}
                </Link>
              ) : row.targetId != null ? (
                `#${row.targetId}`
              ) : (
                t('common.dash')
              )}
            </dd>
            <dt>{t('moderationReportDetail.reason')}</dt>
            <dd style={{ whiteSpace: 'pre-wrap' }}>{row.reason}</dd>
            {row.description ? (
              <>
                <dt>{t('moderationReportDetail.details')}</dt>
                <dd style={{ whiteSpace: 'pre-wrap' }}>{row.description}</dd>
              </>
            ) : null}
            <dt>{t('moderationReportDetail.created')}</dt>
            <dd>{formatDateTime(row.createdAt)}</dd>
            <dt>{t('moderationReportDetail.updated')}</dt>
            <dd>{formatDateTime(row.updatedAt)}</dd>
            {row.resolvedAt ? (
              <>
                <dt>{t('moderationReportDetail.closed')}</dt>
                <dd>{formatDateTime(row.resolvedAt)}</dd>
              </>
            ) : null}
          </dl>
        </Card>
        <Card padding="lg">
          <CardHeader title={t('moderationReportDetail.adminNotes')} />
          <textarea className="vb-modal__textarea" value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} />
          {canAct ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
              {row.status === 'OPEN' ? (
                <Button variant="secondary" onClick={() => setConfirmReview(true)}>
                  {t('moderationReportDetail.markReviewed')}
                </Button>
              ) : null}
              <Button variant="secondary" onClick={() => setConfirmDismiss(true)}>
                {t('moderationReportDetail.dismiss')}
              </Button>
              <Button variant="primary" onClick={() => setConfirmResolve(true)}>
                {t('moderationReportDetail.resolve')}
              </Button>
            </div>
          ) : (
            <p className="vb-muted" style={{ margin: 0 }}>
              {t('moderationReportDetail.closedMsg')}
            </p>
          )}
        </Card>
      </div>

      <ConfirmDialog
        open={confirmResolve}
        title={t('moderationReportDetail.resolveTitle')}
        message={t('moderationReportDetail.resolveMsg')}
        confirmLabel={t('moderationReportDetail.resolve')}
        loading={busy}
        onConfirm={() => void runResolve()}
        onCancel={() => setConfirmResolve(false)}
      />
      <ConfirmDialog
        open={confirmReview}
        title={t('moderationReportDetail.reviewTitle')}
        message={t('moderationReportDetail.reviewMsg')}
        confirmLabel={t('moderationReportDetail.reviewConfirm')}
        loading={busy}
        onConfirm={() => void runReview()}
        onCancel={() => setConfirmReview(false)}
      />
      <ConfirmDialog
        open={confirmDismiss}
        title={t('moderationReportDetail.dismissTitle')}
        message={t('moderationReportDetail.dismissMsg')}
        confirmLabel={t('moderationReportDetail.dismiss')}
        loading={busy}
        onConfirm={() => void runDismiss()}
        onCancel={() => setConfirmDismiss(false)}
      />
    </div>
  );
}
