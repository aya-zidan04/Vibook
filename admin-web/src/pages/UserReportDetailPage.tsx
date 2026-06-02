import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { fetchAdminUserReport, updateAdminUserReportStatus } from '@/api/adminApi';
import type { AdminUserReportResponse, UserReportStatus } from '@/api/types';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader } from '@/components/ui/Card';
import { UserReportStatusBadge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/useToast';
import { useAdminI18n } from '@/i18n/useAdminI18n';
import { getFriendlyErrorMessage } from '@/utils/apiError';
import { formatDateTime } from '@/utils/format';

const STATUS_OPTIONS: UserReportStatus[] = ['OPEN', 'IN_PROGRESS', 'RESOLVED'];

export function UserReportDetailPage() {
  const { t } = useAdminI18n();
  const { id: idParam } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const id = idParam ? Number(idParam) : NaN;
  const valid = Number.isFinite(id);

  const [row, setRow] = useState<AdminUserReportResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<UserReportStatus>('OPEN');
  const [busy, setBusy] = useState(false);

  function statusLabel(s: UserReportStatus): string {
    if (s === 'IN_PROGRESS') return t('status.inProgress');
    if (s === 'RESOLVED') return t('status.resolved');
    return t('status.open');
  }

  useEffect(() => {
    if (!valid) return;
    let c = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const r = await fetchAdminUserReport(id);
        if (!c) {
          setRow(r);
          setStatus(r.status);
        }
      } catch (e) {
        if (!c) setError(getFriendlyErrorMessage(e, t('reports.loadError')));
      } finally {
        if (!c) setLoading(false);
      }
    })();
    return () => {
      c = true;
    };
  }, [id, valid, t]);

  async function saveStatus() {
    if (!valid || !row) return;
    setBusy(true);
    try {
      const r = await updateAdminUserReportStatus(id, status);
      setRow(r);
      showToast(t('reports.statusUpdated'), 'success');
    } catch (e) {
      showToast(getFriendlyErrorMessage(e, t('reports.statusFailed')), 'error');
    } finally {
      setBusy(false);
    }
  }

  if (!valid) {
    return (
      <div className="vb-page">
        <EmptyState title={t('reports.invalid')} description={t('reports.invalidDesc')} decor />
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
        <EmptyState title={t('reports.notFound')} description={error ?? t('reports.notFoundDesc')} decor />
        <Link to="/reports">{t('common.back')}</Link>
      </div>
    );
  }

  return (
    <div className="vb-page vb-animate-in">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>
        {t('common.back')}
      </Button>
      <h1 style={{ marginTop: 0 }}>{t('reports.problemTitle', { id: row.id })}</h1>
      <div style={{ marginBottom: 16 }}>
        <UserReportStatusBadge status={row.status} />
      </div>

      <div className="vb-detail-sections">
        <Card padding="lg">
          <CardHeader title={t('reports.details')} />
          <dl className="vb-dl">
            <dt>{t('reports.user')}</dt>
            <dd>
              <Link to={`/users?userId=${row.userId}`}>{row.userEmail}</Link>
            </dd>
            <dt>{t('reports.subject')}</dt>
            <dd>{row.subject}</dd>
            <dt>{t('reports.status')}</dt>
            <dd>
              <UserReportStatusBadge status={row.status} />
            </dd>
            <dt>{t('reports.date')}</dt>
            <dd>{formatDateTime(row.createdAt)}</dd>
            <dt>{t('users.updated')}</dt>
            <dd>{formatDateTime(row.updatedAt)}</dd>
            <dt>{t('reports.message')}</dt>
            <dd style={{ whiteSpace: 'pre-wrap' }}>{row.message}</dd>
          </dl>
        </Card>
        <Card padding="lg">
          <CardHeader title={t('reports.updateStatus')} />
          <select
            className="vb-modal__textarea"
            value={status}
            onChange={(e) => setStatus(e.target.value as UserReportStatus)}
            style={{ minHeight: 'auto', padding: '10px 12px' }}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {statusLabel(s)}
              </option>
            ))}
          </select>
          <div style={{ marginTop: 12 }}>
            <Button variant="primary" disabled={busy || status === row.status} onClick={() => void saveStatus()}>
              {busy ? t('common.saving') : t('common.saveStatus')}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
