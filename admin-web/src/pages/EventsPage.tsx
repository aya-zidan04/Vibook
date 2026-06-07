import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  deleteAdminEvent,
  fetchAdminEventsPage,
  fetchAllGovernorates,
  fetchCategories,
  hideAdminEvent,
  showAdminEvent,
} from '@/api/adminApi';
import type { AdminEventRowResponse, CategoryResponse, GovernorateResponse } from '@/api/types';
import { useAdminChrome } from '@/components/layout/useAdminChrome';
import { EventVisibilityBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/useToast';
import { useAdminI18n } from '@/i18n/useAdminI18n';
import { getFriendlyErrorMessage } from '@/utils/apiError';
import { localizedGovernorateName } from '@/utils/governorateLabels';
import { formatDateTime } from '@/utils/format';

type Dialog = null | { type: 'delete' | 'hide' | 'show'; row: AdminEventRowResponse };

export function EventsPage() {
  const { t, locale } = useAdminI18n();
  const { headerSearch } = useAdminChrome();
  const { showToast } = useToast();
  const [rows, setRows] = useState<AdminEventRowResponse[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [governorateId, setGovernorateId] = useState<number | ''>('');
  const [visibility, setVisibility] = useState<string>('ALL');
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [governorates, setGovernorates] = useState<GovernorateResponse[]>([]);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const [cats, govs] = await Promise.all([fetchCategories(), fetchAllGovernorates()]);
        setCategories(cats.filter((c) => c.active));
        setGovernorates(govs);
      } catch {
        /* optional */
      }
    })();
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminEventsPage({
        categoryId: categoryId === '' ? undefined : categoryId,
        governorateId: governorateId === '' ? undefined : governorateId,
        visibility: visibility === 'ALL' ? undefined : visibility,
        search: headerSearch.trim() || undefined,
        page,
        size: 15,
        sort: 'createdAt,desc',
      });
      setRows(data.content);
      setTotalPages(data.totalPages);
    } catch (e) {
      setError(getFriendlyErrorMessage(e, t('events.loadError')));
    } finally {
      setLoading(false);
    }
  }, [categoryId, governorateId, visibility, headerSearch, page, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredRows = useMemo(() => rows, [rows]);

  async function runDialogAction() {
    if (!dialog) return;
    setBusy(true);
    try {
      if (dialog.type === 'delete') {
        await deleteAdminEvent(dialog.row.id);
        showToast(t('events.deletedToast'), 'success');
      } else if (dialog.type === 'hide') {
        await hideAdminEvent(dialog.row.id);
        showToast(t('events.hiddenToast'), 'success');
      } else {
        await showAdminEvent(dialog.row.id);
        showToast(t('events.shownToast'), 'success');
      }
      setDialog(null);
      await load();
    } catch (e) {
      showToast(getFriendlyErrorMessage(e, t('events.actionFailed')), 'error');
    } finally {
      setBusy(false);
    }
  }

  if (error) {
    return (
      <div className="vb-page">
        <EmptyState title={t('events.unavailable')} description={error} decor />
      </div>
    );
  }

  return (
    <div className="vb-page vb-animate-in">
      <p className="vb-muted" style={{ marginTop: 0 }}>
        {t('events.intro')}
      </p>
      <div className="vb-toolbar">
        <div className="vb-toolbar__field">
          <label htmlFor="ev-cat">{t('filters.category')}</label>
          <select
            id="ev-cat"
            className="vb-input"
            value={categoryId === '' ? '' : String(categoryId)}
            onChange={(e) => {
              setPage(0);
              setCategoryId(e.target.value === '' ? '' : Number(e.target.value));
            }}
          >
            <option value="">{t('filters.all')}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="vb-toolbar__field">
          <label htmlFor="ev-gov">{t('filters.governorate')}</label>
          <select
            id="ev-gov"
            className="vb-input"
            value={governorateId === '' ? '' : String(governorateId)}
            onChange={(e) => {
              setPage(0);
              setGovernorateId(e.target.value === '' ? '' : Number(e.target.value));
            }}
          >
            <option value="">{t('filters.all')}</option>
            {governorates.map((g) => (
              <option key={g.id} value={g.id}>
                {localizedGovernorateName(g.name, locale)}
              </option>
            ))}
          </select>
        </div>
        <div className="vb-toolbar__field">
          <label htmlFor="ev-vis">{t('filters.visibility')}</label>
          <select
            id="ev-vis"
            className="vb-input"
            value={visibility}
            onChange={(e) => {
              setPage(0);
              setVisibility(e.target.value);
            }}
          >
            <option value="ALL">{t('filters.all')}</option>
            <option value="VISIBLE">{t('status.visible')}</option>
            <option value="HIDDEN">{t('status.hidden')}</option>
            <option value="DRAFT">{t('filters.draftNoData')}</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="vb-table-wrap">
          <table className="vb-table">
            <thead>
              <tr>
                {[
                  t('table.title'),
                  t('table.business'),
                  t('table.category'),
                  t('table.gov'),
                  t('table.eventDate'),
                  t('table.price'),
                  t('table.capacity'),
                  t('table.photos'),
                  t('table.status'),
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
                  <td colSpan={11}>
                    <div className="vb-skeleton" style={{ height: 20 }} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : filteredRows.length === 0 ? (
        <EmptyState
          title={t('events.noEvents')}
          description={headerSearch.trim() ? t('events.noEventsSearch') : t('events.noEventsFilter')}
          decor
        />
      ) : (
        <>
          <div className="vb-table-wrap">
            <table className="vb-table">
              <thead>
                <tr>
                  <th>{t('table.title')}</th>
                  <th>{t('table.business')}</th>
                  <th>{t('table.category')}</th>
                  <th>{t('table.gov')}</th>
                  <th>{t('table.eventDate')}</th>
                  <th>{t('table.price')}</th>
                  <th>{t('table.capacity')}</th>
                  <th>{t('table.photos')}</th>
                  <th>{t('table.status')}</th>
                  <th>{t('table.created')}</th>
                  <th>{t('table.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <strong>{r.title}</strong>
                    </td>
                    <td>{r.businessName ?? t('common.dash')}</td>
                    <td>{r.categoryName ?? t('common.dash')}</td>
                    <td>{localizedGovernorateName(r.governorateName, locale) || t('common.dash')}</td>
                    <td>{r.eventDate}</td>
                    <td>
                      {r.priceJod} {r.currency}
                    </td>
                    <td>{r.capacityGuests}</td>
                    <td>{r.photoCount}</td>
                    <td>
                      <EventVisibilityBadge status={r.visibilityStatus} />
                    </td>
                    <td>{formatDateTime(r.createdAt)}</td>
                    <td>
                      <div className="vb-table-actions">
                        <Link to={`/events/${r.id}`}>
                          <Button variant="secondary" size="sm">
                            {t('table.view')}
                          </Button>
                        </Link>
                        {r.visibilityStatus === 'HIDDEN' ? (
                          <Button variant="primary" size="sm" onClick={() => setDialog({ type: 'show', row: r })}>
                            {t('events.showConfirm')}
                          </Button>
                        ) : (
                          <Button variant="secondary" size="sm" onClick={() => setDialog({ type: 'hide', row: r })}>
                            {t('events.hideConfirm')}
                          </Button>
                        )}
                        <Button variant="dangerOutline" size="sm" onClick={() => setDialog({ type: 'delete', row: r })}>
                          {t('events.deleteConfirm')}
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
        open={dialog?.type === 'delete'}
        title={t('events.deleteTitle')}
        message={t('events.deleteMsg', {
          title:
            dialog?.type === 'delete' ? dialog.row.title ?? t('events.untitled') : '',
        })}
        confirmLabel={t('events.deleteConfirm')}
        onConfirm={() => void runDialogAction()}
        onCancel={() => setDialog(null)}
        danger
        loading={busy}
      />
      <ConfirmDialog
        open={dialog?.type === 'hide'}
        title={t('events.hideTitle')}
        message={t('events.hideMsg', {
          title: dialog?.type === 'hide' ? dialog.row.title ?? t('events.untitled') : '',
        })}
        confirmLabel={t('events.hideConfirm')}
        onConfirm={() => void runDialogAction()}
        onCancel={() => setDialog(null)}
        loading={busy}
      />
      <ConfirmDialog
        open={dialog?.type === 'show'}
        title={t('events.showTitle')}
        message={t('events.showMsg', {
          title: dialog?.type === 'show' ? dialog.row.title ?? t('events.untitled') : '',
        })}
        confirmLabel={t('events.showConfirm')}
        onConfirm={() => void runDialogAction()}
        onCancel={() => setDialog(null)}
        loading={busy}
      />
    </div>
  );
}
