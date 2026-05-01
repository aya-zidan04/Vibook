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
import { getFriendlyErrorMessage } from '@/utils/apiError';
import { formatDateTime } from '@/utils/format';

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
        if (!c) setError(getFriendlyErrorMessage(e, 'Could not load report.'));
      } finally {
        if (!c) setLoading(false);
      }
    })();
    return () => {
      c = true;
    };
  }, [id, valid]);

  async function runResolve() {
    if (!valid) return;
    setBusy(true);
    try {
      const r = await resolveAdminReport(id, notes.trim() || null);
      setRow(r);
      showToast('Report resolved.', 'success');
      setConfirmResolve(false);
    } catch (e) {
      showToast(getFriendlyErrorMessage(e, 'Could not resolve.'), 'error');
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
      showToast('Marked as reviewed.', 'success');
      setConfirmReview(false);
    } catch (e) {
      showToast(getFriendlyErrorMessage(e, 'Could not update.'), 'error');
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
      showToast('Report dismissed.', 'success');
      setConfirmDismiss(false);
    } catch (e) {
      showToast(getFriendlyErrorMessage(e, 'Could not dismiss.'), 'error');
    } finally {
      setBusy(false);
    }
  }

  if (!valid) {
    return (
      <div className="vb-page">
        <EmptyState title="Invalid report" description="Check the URL." decor />
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
        <EmptyState title="Report unavailable" description={error ?? 'Not found.'} decor />
        <Link to="/reports">← Back</Link>
      </div>
    );
  }

  const targetHref = reportTargetHref(row);
  const canAct = row.status === 'OPEN' || row.status === 'REVIEWED';

  return (
    <div className="vb-page vb-animate-in">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>
        ← Back
      </Button>
      <h1 style={{ marginTop: 0 }}>Report #{row.id}</h1>
      <div style={{ marginBottom: 16 }}>
        <ReportStatusBadge status={row.status} />
      </div>

      <div className="vb-detail-sections">
        <Card padding="lg">
          <CardHeader title="Summary" />
          <dl className="vb-dl">
            <dt>Reporter</dt>
            <dd>
              <Link to={`/users?userId=${row.reporterUserId}`}>{row.reporterEmail}</Link>
            </dd>
            <dt>Type</dt>
            <dd>{row.type}</dd>
            <dt>Target</dt>
            <dd>
              {targetHref ? (
                <Link to={targetHref}>
                  {row.targetId != null ? `Open related record #${row.targetId}` : 'Open related view'}
                </Link>
              ) : row.targetId != null ? (
                `#${row.targetId}`
              ) : (
                '—'
              )}
            </dd>
            <dt>Reason</dt>
            <dd style={{ whiteSpace: 'pre-wrap' }}>{row.reason}</dd>
            {row.description ? (
              <>
                <dt>Details</dt>
                <dd style={{ whiteSpace: 'pre-wrap' }}>{row.description}</dd>
              </>
            ) : null}
            <dt>Created</dt>
            <dd>{formatDateTime(row.createdAt)}</dd>
            <dt>Updated</dt>
            <dd>{formatDateTime(row.updatedAt)}</dd>
            {row.resolvedAt ? (
              <>
                <dt>Closed</dt>
                <dd>{formatDateTime(row.resolvedAt)}</dd>
              </>
            ) : null}
          </dl>
        </Card>
        <Card padding="lg">
          <CardHeader title="Admin notes" />
          <textarea className="vb-modal__textarea" value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} />
          {canAct ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
              {row.status === 'OPEN' ? (
                <Button variant="secondary" onClick={() => setConfirmReview(true)}>
                  Mark reviewed
                </Button>
              ) : null}
              <Button variant="secondary" onClick={() => setConfirmDismiss(true)}>
                Dismiss
              </Button>
              <Button variant="primary" onClick={() => setConfirmResolve(true)}>
                Resolve
              </Button>
            </div>
          ) : (
            <p className="vb-muted" style={{ margin: 0 }}>
              This report is closed.
            </p>
          )}
        </Card>
      </div>

      <ConfirmDialog
        open={confirmResolve}
        title="Resolve report"
        message="Mark this report as resolved with the notes above?"
        confirmLabel="Resolve"
        loading={busy}
        onConfirm={() => void runResolve()}
        onCancel={() => setConfirmResolve(false)}
      />
      <ConfirmDialog
        open={confirmReview}
        title="Mark as reviewed"
        message="Set status to reviewed and save the notes above?"
        confirmLabel="Mark reviewed"
        loading={busy}
        onConfirm={() => void runReview()}
        onCancel={() => setConfirmReview(false)}
      />
      <ConfirmDialog
        open={confirmDismiss}
        title="Dismiss report"
        message="Dismiss this report as not actionable? You can still add notes above."
        confirmLabel="Dismiss"
        loading={busy}
        onConfirm={() => void runDismiss()}
        onCancel={() => setConfirmDismiss(false)}
      />
    </div>
  );
}
