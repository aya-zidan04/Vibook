import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteAdminRating, fetchAdminRatingsPage, setAdminRatingHidden } from '@/api/adminApi';
import type { AdminEventRatingResponse } from '@/api/types';
import { useAdminChrome } from '@/components/layout/useAdminChrome';
import { Button } from '@/components/ui/Button';
import { RoleBadge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/useToast';
import { useAdminI18n } from '@/i18n/useAdminI18n';
import { getFriendlyErrorMessage } from '@/utils/apiError';
import { formatDateTime } from '@/utils/format';

export function RatingsPage() {
  const { t } = useAdminI18n();
  const { headerSearch } = useAdminChrome();
  const { showToast } = useToast();
  const [rows, setRows] = useState<AdminEventRatingResponse[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [minStars, setMinStars] = useState<number | ''>('');
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminRatingsPage({
        minRating: minStars === '' ? undefined : minStars,
        flaggedOnly: flaggedOnly || undefined,
        search: headerSearch.trim() || undefined,
        page,
        size: 20,
        sort: 'createdAt,desc',
      });
      setRows(data.content);
      setTotalPages(data.totalPages);
    } catch (e) {
      setError(getFriendlyErrorMessage(e, t('ratings.loadError')));
    } finally {
      setLoading(false);
    }
  }, [minStars, flaggedOnly, headerSearch, page, t]);

  useEffect(() => {
    void load();
  }, [load]);

  async function confirmDelete() {
    if (deleteId == null) return;
    setBusy(true);
    try {
      await deleteAdminRating(deleteId);
      showToast(t('ratings.removedToast'), 'success');
      setDeleteId(null);
      await load();
    } catch (e) {
      showToast(getFriendlyErrorMessage(e, t('ratings.deleteFailed')), 'error');
    } finally {
      setBusy(false);
    }
  }

  async function toggleHide(r: AdminEventRatingResponse) {
    setBusy(true);
    try {
      await setAdminRatingHidden(r.id, !r.moderationHidden);
      showToast(r.moderationHidden ? t('ratings.visibleToast') : t('ratings.hiddenToast'), 'success');
      await load();
    } catch (e) {
      showToast(getFriendlyErrorMessage(e, t('ratings.updateFailed')), 'error');
    } finally {
      setBusy(false);
    }
  }

  if (error) {
    return (
      <div className="vb-page">
        <EmptyState title={t('ratings.unavailable')} description={error} decor />
      </div>
    );
  }

  return (
    <div className="vb-page vb-animate-in">
      <p className="vb-muted" style={{ marginTop: 0 }}>
        {t('ratings.intro')}
      </p>
      <div className="vb-toolbar">
        <div className="vb-toolbar__field">
          <label htmlFor="rt-min">{t('filters.minStars')}</label>
          <select
            id="rt-min"
            className="vb-input"
            value={minStars === '' ? '' : String(minStars)}
            onChange={(e) => {
              setPage(0);
              setMinStars(e.target.value === '' ? '' : Number(e.target.value));
            }}
          >
            <option value="">{t('filters.any')}</option>
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {t('ratings.starsPlus', { n })}
              </option>
            ))}
          </select>
        </div>
        <label className="vb-toolbar__field" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <input
            type="checkbox"
            checked={flaggedOnly}
            onChange={(e) => {
              setPage(0);
              setFlaggedOnly(e.target.checked);
            }}
          />
          <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{t('filters.flaggedOnly')}</span>
        </label>
      </div>

      {loading ? (
        <div className="vb-table-wrap">
          <table className="vb-table">
            <thead>
              <tr>
                {[
                  t('table.user'),
                  t('table.eventBusiness'),
                  t('table.stars'),
                  t('table.moderation'),
                  t('table.created'),
                  t('table.actions'),
                ].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={6}>
                    <div className="vb-skeleton" style={{ height: 20 }} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : rows.length === 0 ? (
        <EmptyState title={t('ratings.noRatings')} description={t('ratings.noRatingsDesc')} decor />
      ) : (
        <>
          <div className="vb-table-wrap">
            <table className="vb-table">
              <thead>
                <tr>
                  <th>{t('table.user')}</th>
                  <th>{t('table.eventBusiness')}</th>
                  <th>{t('table.stars')}</th>
                  <th>{t('table.moderation')}</th>
                  <th>{t('table.created')}</th>
                  <th>{t('table.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <Link to={`/users?userId=${r.userId}`}>{r.userEmail}</Link>
                    </td>
                    <td>
                      <Link to={`/events/${r.eventId}`}>{r.eventTitle ?? t('ratings.eventFallback')}</Link>
                      <div className="vb-muted" style={{ fontSize: '0.8125rem' }}>
                        {r.businessName}
                      </div>
                    </td>
                    <td>
                      {r.ratingValue} ★
                    </td>
                    <td>
                      {r.moderationHidden ? <RoleBadge label={t('ratings.hiddenBadge')} /> : null}
                      {r.flagged ? <RoleBadge label={t('ratings.flaggedBadge')} /> : null}
                      {!r.moderationHidden && !r.flagged ? <span className="vb-muted">{t('common.dash')}</span> : null}
                    </td>
                    <td>{formatDateTime(r.createdAt)}</td>
                    <td>
                      <div className="vb-table-actions">
                        <Button variant="secondary" size="sm" disabled={busy} onClick={() => void toggleHide(r)}>
                          {r.moderationHidden ? t('ratings.unhide') : t('ratings.hide')}
                        </Button>
                        <Button variant="dangerOutline" size="sm" onClick={() => setDeleteId(r.id)}>
                          {t('ratings.delete')}
                        </Button>
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
        open={deleteId != null}
        title={t('ratings.deleteTitle')}
        message={t('ratings.deleteMsg')}
        confirmLabel={t('ratings.delete')}
        danger
        loading={busy}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
