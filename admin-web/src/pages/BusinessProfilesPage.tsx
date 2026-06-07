import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  approveBusinessProfile,
  bulkApproveBusinessProfiles,
  bulkRejectBusinessProfiles,
  fetchAllGovernorates,
  fetchBusinessProfilesPage,
  fetchCategories,
  rejectBusinessProfile,
} from '@/api/adminApi';
import type { BusinessProfileResponse, BusinessProfileStatus, CategoryResponse, GovernorateResponse } from '@/api/types';
import { BusinessProfileFilterBar } from '@/components/business-profiles/BusinessProfileFilterBar';
import { useAdminChrome } from '@/components/layout/useAdminChrome';
import { Button } from '@/components/ui/Button';
import { BusinessProfileStatusBadge, ReApprovalBadge } from '@/components/ui/Badge';
import { isFirstTimePending, isReapprovalPending } from '@/utils/businessProfilePresentation';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/useToast';
import { useAdminI18n } from '@/i18n/useAdminI18n';
import { getFriendlyErrorMessage } from '@/utils/apiError';
import { localizedGovernorateName } from '@/utils/governorateLabels';
import { formatDateTime } from '@/utils/format';

type DialogState =
  | null
  | { type: 'approve' | 'reject'; id: number; name: string; requiresReApproval?: boolean }
  | { type: 'bulk-approve' | 'bulk-reject' };

const SORT_VALUES = [
  'createdAt,desc',
  'createdAt,asc',
  'businessName,asc',
  'businessName,desc',
  'status,asc',
  'status,desc',
] as const;

const SORT_LABEL_KEY: Record<(typeof SORT_VALUES)[number], string> = {
  'createdAt,desc': 'sort.newest',
  'createdAt,asc': 'sort.oldest',
  'businessName,asc': 'sort.nameAz',
  'businessName,desc': 'sort.nameZa',
  'status,asc': 'sort.statusAz',
  'status,desc': 'sort.statusZa',
};

export function BusinessProfilesPage() {
  const { t, locale } = useAdminI18n();
  const { headerSearch } = useAdminChrome();
  const { showToast } = useToast();
  const [filter, setFilter] = useState<'ALL' | BusinessProfileStatus>('ALL');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [governorateId, setGovernorateId] = useState<number | ''>('');
  const [createdFrom, setCreatedFrom] = useState('');
  const [createdTo, setCreatedTo] = useState('');
  const [sort, setSort] = useState('createdAt,desc');
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [governorates, setGovernorates] = useState<GovernorateResponse[]>([]);
  const [rows, setRows] = useState<BusinessProfileResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [dialog, setDialog] = useState<DialogState>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const loadMeta = useCallback(async () => {
    try {
      const [cats, govs] = await Promise.all([fetchCategories(), fetchAllGovernorates()]);
      setCategories(cats.filter((c) => c.active));
      setGovernorates(govs);
    } catch {
      /* filters still work partially */
    }
  }, []);

  useEffect(() => {
    void loadMeta();
  }, [loadMeta]);

  const loadRows = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const page = await fetchBusinessProfilesPage({
        status: filter,
        categoryId: categoryId === '' ? undefined : categoryId,
        governorateId: governorateId === '' ? undefined : governorateId,
        createdFrom: createdFrom || undefined,
        createdTo: createdTo || undefined,
        page: 0,
        size: 200,
        sort,
      });
      setRows(page.content);
      setSelected(new Set());
    } catch (e) {
      setError(getFriendlyErrorMessage(e, t('businessProfiles.loadError')));
    } finally {
      setLoading(false);
    }
  }, [filter, categoryId, governorateId, createdFrom, createdTo, sort, t]);

  useEffect(() => {
    void loadRows();
  }, [loadRows]);

  const filteredRows = useMemo(() => {
    const q = headerSearch.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((p) => {
      const name = p.businessName?.toLowerCase() ?? '';
      const email = p.ownerEmail?.toLowerCase() ?? '';
      const work = p.workEmail?.toLowerCase() ?? '';
      const phone = p.phone?.toLowerCase() ?? '';
      return name.includes(q) || email.includes(q) || work.includes(q) || phone.includes(q);
    });
  }, [rows, headerSearch]);

  const selectablePending = useMemo(
    () => filteredRows.filter((p) => p.status === 'PENDING_REVIEW').map((p) => p.id),
    [filteredRows],
  );

  const selectedPendingIds = useMemo(
    () => [...selected].filter((id) => filteredRows.some((p) => p.id === id && p.status === 'PENDING_REVIEW')),
    [selected, filteredRows],
  );

  function toggleRow(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAllOnPage() {
    const pendingOnPage = selectablePending;
    const allSelected = pendingOnPage.length > 0 && pendingOnPage.every((id) => selected.has(id));
    setSelected((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        pendingOnPage.forEach((id) => next.delete(id));
      } else {
        pendingOnPage.forEach((id) => next.add(id));
      }
      return next;
    });
  }

  async function runApprove() {
    if (!dialog || dialog.type !== 'approve') return;
    setBusyId(dialog.id);
    try {
      await approveBusinessProfile(dialog.id);
      showToast(
        dialog.requiresReApproval
          ? t('businessProfiles.approvedChangesToast')
          : t('businessProfiles.approvedToast'),
        'success',
      );
      setDialog(null);
      await loadRows();
    } catch (e) {
      showToast(getFriendlyErrorMessage(e, t('businessProfiles.approveFailed')), 'error');
    } finally {
      setBusyId(null);
    }
  }

  async function runReject() {
    if (!dialog || dialog.type !== 'reject') return;
    setBusyId(dialog.id);
    try {
      await rejectBusinessProfile(dialog.id, rejectReason.trim() || undefined);
      showToast(
        dialog.requiresReApproval
          ? t('businessProfiles.rejectedChangesToast')
          : t('businessProfiles.rejectedToast'),
        'success',
      );
      setDialog(null);
      setRejectReason('');
      await loadRows();
    } catch (e) {
      showToast(getFriendlyErrorMessage(e, t('businessProfiles.rejectFailed')), 'error');
    } finally {
      setBusyId(null);
    }
  }

  async function runBulkApprove() {
    if (!dialog || dialog.type !== 'bulk-approve') return;
    if (selectedPendingIds.length === 0) {
      setDialog(null);
      return;
    }
    setBusyId(-1);
    try {
      await bulkApproveBusinessProfiles(selectedPendingIds);
      showToast(t('businessProfiles.bulkApprovedToast', { count: selectedPendingIds.length }), 'success');
      setDialog(null);
      await loadRows();
    } catch (e) {
      showToast(getFriendlyErrorMessage(e, t('businessProfiles.bulkApproveFailed')), 'error');
    } finally {
      setBusyId(null);
    }
  }

  async function runBulkReject() {
    if (!dialog || dialog.type !== 'bulk-reject') return;
    if (selectedPendingIds.length === 0) {
      setDialog(null);
      return;
    }
    setBusyId(-1);
    try {
      await bulkRejectBusinessProfiles(selectedPendingIds, rejectReason.trim() || undefined);
      showToast(t('businessProfiles.bulkRejectedToast', { count: selectedPendingIds.length }), 'success');
      setDialog(null);
      setRejectReason('');
      await loadRows();
    } catch (e) {
      showToast(getFriendlyErrorMessage(e, t('businessProfiles.bulkRejectFailed')), 'error');
    } finally {
      setBusyId(null);
    }
  }

  const allPendingSelected =
    selectablePending.length > 0 && selectablePending.every((id) => selected.has(id));

  return (
    <div className="vb-page">
      <BusinessProfileFilterBar value={filter} onChange={setFilter} />

      <div className="vb-toolbar">
        <div className="vb-toolbar__field">
          <label htmlFor="bf-cat">{t('filters.category')}</label>
          <select
            id="bf-cat"
            className="vb-input"
            value={categoryId === '' ? '' : String(categoryId)}
            onChange={(e) => setCategoryId(e.target.value === '' ? '' : Number(e.target.value))}
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
          <label htmlFor="bf-gov">{t('filters.governorate')}</label>
          <select
            id="bf-gov"
            className="vb-input"
            value={governorateId === '' ? '' : String(governorateId)}
            onChange={(e) => setGovernorateId(e.target.value === '' ? '' : Number(e.target.value))}
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
          <label htmlFor="bf-from">{t('filters.createdFrom')}</label>
          <input
            id="bf-from"
            type="date"
            className="vb-input"
            value={createdFrom}
            onChange={(e) => setCreatedFrom(e.target.value)}
          />
        </div>
        <div className="vb-toolbar__field">
          <label htmlFor="bf-to">{t('filters.createdTo')}</label>
          <input
            id="bf-to"
            type="date"
            className="vb-input"
            value={createdTo}
            onChange={(e) => setCreatedTo(e.target.value)}
          />
        </div>
        <div className="vb-toolbar__field">
          <label htmlFor="bf-sort">{t('filters.sort')}</label>
          <select id="bf-sort" className="vb-input" value={sort} onChange={(e) => setSort(e.target.value)}>
            {SORT_VALUES.map((value) => (
              <option key={value} value={value}>
                {t(SORT_LABEL_KEY[value])}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedPendingIds.length > 0 ? (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 'var(--vb-space-sm)',
            marginBottom: 'var(--vb-space-md)',
            alignItems: 'center',
          }}
        >
          <span className="vb-muted" style={{ fontSize: '0.875rem' }}>
            {t('businessProfiles.pendingSelected', { count: selectedPendingIds.length })}
          </span>
          <Button variant="primary" size="sm" onClick={() => setDialog({ type: 'bulk-approve' })}>
            {t('businessProfiles.approveSelected')}
          </Button>
          <Button
            variant="dangerOutline"
            size="sm"
            onClick={() => {
              setRejectReason('');
              setDialog({ type: 'bulk-reject' });
            }}
          >
            {t('businessProfiles.rejectSelected')}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setSelected(new Set())}>
            {t('businessProfiles.clearSelection')}
          </Button>
        </div>
      ) : null}

      {error ? (
        <EmptyState title={t('businessProfiles.somethingWrong')} description={error} decor />
      ) : loading ? (
        <div className="vb-table-wrap">
          <table className="vb-table">
            <thead>
              <tr>
                {[
                  '',
                  t('table.business'),
                  t('table.ownerContact'),
                  t('table.category'),
                  t('table.governorate'),
                  t('table.status'),
                  t('table.created'),
                  t('table.actions'),
                ].map((h) => (
                  <th key={h || 'sel'}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={8}>
                    <div className="vb-skeleton" style={{ height: 20 }} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : filteredRows.length === 0 ? (
        <EmptyState
          title={t('businessProfiles.noMatch')}
          description={
            headerSearch.trim() ? t('businessProfiles.noMatchSearch') : t('businessProfiles.noMatchFilter')
          }
          decor
        />
      ) : (
        <div className="vb-table-wrap">
          <table className="vb-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}>
                  <input
                    type="checkbox"
                    checked={allPendingSelected}
                    onChange={toggleSelectAllOnPage}
                    disabled={selectablePending.length === 0}
                    title={t('table.selectAllPending')}
                    aria-label={t('table.selectAllPending')}
                  />
                </th>
                <th>{t('table.business')}</th>
                <th>{t('table.ownerContact')}</th>
                <th>{t('table.category')}</th>
                <th>{t('table.governorate')}</th>
                <th>{t('table.status')}</th>
                <th>{t('table.created')}</th>
                <th>{t('table.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((p) => {
                const reapproval = isReapprovalPending(p);
                const firstTimePending = isFirstTimePending(p);
                const rowClass = [
                  selected.has(p.id) ? 'vb-table-row--selected' : '',
                  reapproval ? 'vb-table-row--reapproval' : '',
                ]
                  .filter(Boolean)
                  .join(' ');

                return (
                <tr key={p.id} className={rowClass || undefined}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selected.has(p.id)}
                      disabled={p.status !== 'PENDING_REVIEW'}
                      onChange={() => toggleRow(p.id)}
                      aria-label={t('table.selectRow', { name: p.businessName })}
                    />
                  </td>
                  <td>
                    <div className="vb-business-cell">
                      <strong>{p.businessName}</strong>
                      {reapproval ? (
                        <div className="vb-business-cell__subtitle vb-business-cell__subtitle--reapproval">
                          {t('businessProfiles.updatedProfileSubmissionSubtitle')}
                        </div>
                      ) : firstTimePending ? (
                        <div className="vb-business-cell__subtitle">{t('status.newApplication')}</div>
                      ) : null}
                    </div>
                  </td>
                  <td>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.375rem',
                        maxWidth: 300,
                        fontSize: '0.875rem',
                      }}
                    >
                      <div>
                        <div
                          className="vb-muted"
                          style={{ fontSize: '0.6875rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}
                        >
                          {t('table.account')}
                        </div>
                        <div>{p.ownerEmail ?? t('common.dash')}</div>
                      </div>
                      <div>
                        <div
                          className="vb-muted"
                          style={{ fontSize: '0.6875rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}
                        >
                          {t('table.workEmail')}
                        </div>
                        <div>
                          {p.workEmail ? (
                            <a href={`mailto:${encodeURIComponent(p.workEmail)}`}>{p.workEmail}</a>
                          ) : (
                            t('common.dash')
                          )}
                        </div>
                      </div>
                      <div>
                        <div
                          className="vb-muted"
                          style={{ fontSize: '0.6875rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}
                        >
                          {t('table.phone')}
                        </div>
                        <div>
                          {p.phone ? (
                            <a href={`tel:${p.phone.replace(/\s/g, '')}`}>{p.phone}</a>
                          ) : (
                            t('common.dash')
                          )}
                        </div>
                      </div>
                      {p.ownerUserId != null ? (
                        <Link
                          to={`/users?userId=${p.ownerUserId}`}
                          style={{ fontSize: '0.8125rem', fontWeight: 600, marginTop: 2 }}
                        >
                          {t('businessProfiles.viewOwner')}
                        </Link>
                      ) : null}
                    </div>
                  </td>
                  <td>{p.primaryCategoryName ?? t('common.dash')}</td>
                  <td>{localizedGovernorateName(p.governorateName, locale) || t('common.dash')}</td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', alignItems: 'center' }}>
                      <BusinessProfileStatusBadge
                        status={p.status}
                        requiresReApproval={p.requiresReApproval}
                        previouslyApproved={p.previouslyApproved}
                      />
                      {reapproval ? <ReApprovalBadge /> : null}
                    </div>
                  </td>
                  <td>{formatDateTime(p.createdAt)}</td>
                  <td>
                    <div className="vb-table-actions">
                      <Link to={`/business-profiles/${p.id}`}>
                        <Button variant="secondary" size="sm">
                          {t('table.view')}
                        </Button>
                      </Link>
                      {p.status === 'PENDING_REVIEW' ? (
                        <>
                          <Button
                            variant="primary"
                            size="sm"
                            disabled={busyId === p.id}
                            onClick={() =>
                              setDialog({
                                type: 'approve',
                                id: p.id,
                                name: p.businessName,
                                requiresReApproval: reapproval,
                              })
                            }
                          >
                            {reapproval
                              ? t('businessProfiles.approveChangesReactivate')
                              : t('businessProfiles.approve')}
                          </Button>
                          <Button
                            variant="dangerOutline"
                            size="sm"
                            disabled={busyId === p.id}
                            onClick={() => {
                              setRejectReason('');
                              setDialog({
                                type: 'reject',
                                id: p.id,
                                name: p.businessName,
                                requiresReApproval: reapproval,
                              });
                            }}
                          >
                            {reapproval ? t('businessProfiles.rejectChanges') : t('businessProfiles.reject')}
                          </Button>
                        </>
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
              })}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={dialog?.type === 'approve'}
        title={
          dialog?.type === 'approve' && dialog.requiresReApproval
            ? t('businessProfiles.approveChangesTitle')
            : t('businessProfiles.approveTitle')
        }
        message={
          dialog?.type === 'approve' && dialog.requiresReApproval
            ? t('businessProfiles.approveChangesMsg', { name: dialog.name })
            : t('businessProfiles.approveMsg', {
                name: dialog?.type === 'approve' ? dialog.name : '',
              })
        }
        confirmLabel={
          dialog?.type === 'approve' && dialog.requiresReApproval
            ? t('businessProfiles.approveChangesConfirm')
            : t('businessProfiles.approveConfirm')
        }
        onConfirm={() => void runApprove()}
        onCancel={() => setDialog(null)}
        loading={busyId != null}
      />

      <ConfirmDialog
        open={dialog?.type === 'reject'}
        title={
          dialog?.type === 'reject' && dialog.requiresReApproval
            ? t('businessProfiles.rejectChangesTitle')
            : t('businessProfiles.rejectTitle')
        }
        message={
          dialog?.type === 'reject' && dialog.requiresReApproval
            ? t('businessProfiles.rejectChangesMsg', { name: dialog.name })
            : t('businessProfiles.rejectMsg', {
                name: dialog?.type === 'reject' ? dialog.name : '',
              })
        }
        confirmLabel={
          dialog?.type === 'reject' && dialog.requiresReApproval
            ? t('businessProfiles.rejectChangesConfirm')
            : t('businessProfiles.rejectConfirm')
        }
        onConfirm={() => void runReject()}
        onCancel={() => {
          setDialog(null);
          setRejectReason('');
        }}
        danger
        loading={busyId != null}
      >
        <label className="vb-field__label" htmlFor="reject-reason">
          {t('businessProfiles.reasonOptional')}
        </label>
        <textarea
          id="reject-reason"
          className="vb-modal__textarea"
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder={t('businessProfiles.rejectPlaceholder')}
          maxLength={500}
        />
      </ConfirmDialog>

      <ConfirmDialog
        open={dialog?.type === 'bulk-approve'}
        title={t('businessProfiles.bulkApproveTitle')}
        message={t('businessProfiles.bulkApproveMsg', { count: selectedPendingIds.length })}
        confirmLabel={t('businessProfiles.bulkApproveConfirm')}
        onConfirm={() => void runBulkApprove()}
        onCancel={() => setDialog(null)}
        loading={busyId != null}
      />

      <ConfirmDialog
        open={dialog?.type === 'bulk-reject'}
        title={t('businessProfiles.bulkRejectTitle')}
        message={t('businessProfiles.bulkRejectMsg', { count: selectedPendingIds.length })}
        confirmLabel={t('businessProfiles.bulkRejectConfirm')}
        onConfirm={() => void runBulkReject()}
        onCancel={() => {
          setDialog(null);
          setRejectReason('');
        }}
        danger
        loading={busyId != null}
      >
        <label className="vb-field__label" htmlFor="bulk-reject-reason">
          {t('businessProfiles.reasonOptional')}
        </label>
        <textarea
          id="bulk-reject-reason"
          className="vb-modal__textarea"
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          maxLength={500}
        />
      </ConfirmDialog>
    </div>
  );
}
