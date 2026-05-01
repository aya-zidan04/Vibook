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
import { StatusBadge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/useToast';
import { getFriendlyErrorMessage } from '@/utils/apiError';
import { formatDateTime } from '@/utils/format';

type DialogState =
  | null
  | { type: 'approve' | 'reject'; id: number; name: string }
  | { type: 'bulk-approve' | 'bulk-reject' };

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: 'createdAt,desc', label: 'Newest first' },
  { value: 'createdAt,asc', label: 'Oldest first' },
  { value: 'businessName,asc', label: 'Name A–Z' },
  { value: 'businessName,desc', label: 'Name Z–A' },
  { value: 'status,asc', label: 'Status A–Z' },
  { value: 'status,desc', label: 'Status Z–A' },
];

export function BusinessProfilesPage() {
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
      setError(getFriendlyErrorMessage(e, 'Could not load business profiles.'));
    } finally {
      setLoading(false);
    }
  }, [filter, categoryId, governorateId, createdFrom, createdTo, sort]);

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
      showToast('Profile approved.', 'success');
      setDialog(null);
      await loadRows();
    } catch (e) {
      showToast(getFriendlyErrorMessage(e, 'Approve failed.'), 'error');
    } finally {
      setBusyId(null);
    }
  }

  async function runReject() {
    if (!dialog || dialog.type !== 'reject') return;
    setBusyId(dialog.id);
    try {
      await rejectBusinessProfile(dialog.id, rejectReason.trim() || undefined);
      showToast('Profile rejected.', 'success');
      setDialog(null);
      setRejectReason('');
      await loadRows();
    } catch (e) {
      showToast(getFriendlyErrorMessage(e, 'Reject failed.'), 'error');
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
      showToast(`Approved ${selectedPendingIds.length} profile(s).`, 'success');
      setDialog(null);
      await loadRows();
    } catch (e) {
      showToast(getFriendlyErrorMessage(e, 'Bulk approve failed.'), 'error');
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
      showToast(`Rejected ${selectedPendingIds.length} profile(s).`, 'success');
      setDialog(null);
      setRejectReason('');
      await loadRows();
    } catch (e) {
      showToast(getFriendlyErrorMessage(e, 'Bulk reject failed.'), 'error');
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
          <label htmlFor="bf-cat">Category</label>
          <select
            id="bf-cat"
            className="vb-input"
            value={categoryId === '' ? '' : String(categoryId)}
            onChange={(e) => setCategoryId(e.target.value === '' ? '' : Number(e.target.value))}
          >
            <option value="">All</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="vb-toolbar__field">
          <label htmlFor="bf-gov">Governorate</label>
          <select
            id="bf-gov"
            className="vb-input"
            value={governorateId === '' ? '' : String(governorateId)}
            onChange={(e) => setGovernorateId(e.target.value === '' ? '' : Number(e.target.value))}
          >
            <option value="">All</option>
            {governorates.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>
        <div className="vb-toolbar__field">
          <label htmlFor="bf-from">Created from</label>
          <input
            id="bf-from"
            type="date"
            className="vb-input"
            value={createdFrom}
            onChange={(e) => setCreatedFrom(e.target.value)}
          />
        </div>
        <div className="vb-toolbar__field">
          <label htmlFor="bf-to">Created to</label>
          <input
            id="bf-to"
            type="date"
            className="vb-input"
            value={createdTo}
            onChange={(e) => setCreatedTo(e.target.value)}
          />
        </div>
        <div className="vb-toolbar__field">
          <label htmlFor="bf-sort">Sort</label>
          <select id="bf-sort" className="vb-input" value={sort} onChange={(e) => setSort(e.target.value)}>
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
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
            {selectedPendingIds.length} pending selected
          </span>
          <Button variant="primary" size="sm" onClick={() => setDialog({ type: 'bulk-approve' })}>
            Approve selected
          </Button>
          <Button
            variant="dangerOutline"
            size="sm"
            onClick={() => {
              setRejectReason('');
              setDialog({ type: 'bulk-reject' });
            }}
          >
            Reject selected
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setSelected(new Set())}>
            Clear selection
          </Button>
        </div>
      ) : null}

      {error ? (
        <EmptyState title="Something went wrong" description={error} decor />
      ) : loading ? (
        <div className="vb-table-wrap">
          <table className="vb-table">
            <thead>
              <tr>
                {['', 'Business', 'Owner', 'Category', 'Governorate', 'Status', 'Created', 'Actions'].map((h) => (
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
          title="No profiles match"
          description={
            headerSearch.trim()
              ? 'Try a different search or clear the top bar filter.'
              : 'Adjust filters or status chips.'
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
                    title="Select all pending on this page"
                    aria-label="Select all pending"
                  />
                </th>
                <th>Business</th>
                <th>Owner &amp; contact</th>
                <th>Category</th>
                <th>Governorate</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((p) => (
                <tr
                  key={p.id}
                  className={selected.has(p.id) ? 'vb-table-row--selected' : undefined}
                >
                  <td>
                    <input
                      type="checkbox"
                      checked={selected.has(p.id)}
                      disabled={p.status !== 'PENDING_REVIEW'}
                      onChange={() => toggleRow(p.id)}
                      aria-label={`Select ${p.businessName}`}
                    />
                  </td>
                  <td>
                    <strong>{p.businessName}</strong>
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
                          Account
                        </div>
                        <div>{p.ownerEmail ?? '—'}</div>
                      </div>
                      <div>
                        <div
                          className="vb-muted"
                          style={{ fontSize: '0.6875rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}
                        >
                          Work email
                        </div>
                        <div>
                          {p.workEmail ? (
                            <a href={`mailto:${encodeURIComponent(p.workEmail)}`}>{p.workEmail}</a>
                          ) : (
                            '—'
                          )}
                        </div>
                      </div>
                      <div>
                        <div
                          className="vb-muted"
                          style={{ fontSize: '0.6875rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}
                        >
                          Phone
                        </div>
                        <div>
                          {p.phone ? (
                            <a href={`tel:${p.phone.replace(/\s/g, '')}`}>{p.phone}</a>
                          ) : (
                            '—'
                          )}
                        </div>
                      </div>
                      {p.ownerUserId != null ? (
                        <Link
                          to={`/users?userId=${p.ownerUserId}`}
                          style={{ fontSize: '0.8125rem', fontWeight: 600, marginTop: 2 }}
                        >
                          View owner profile
                        </Link>
                      ) : null}
                    </div>
                  </td>
                  <td>{p.primaryCategoryName ?? '—'}</td>
                  <td>{p.governorateName ?? '—'}</td>
                  <td>
                    <StatusBadge status={p.status} />
                  </td>
                  <td>{formatDateTime(p.createdAt)}</td>
                  <td>
                    <div className="vb-table-actions">
                      <Link to={`/business-profiles/${p.id}`}>
                        <Button variant="secondary" size="sm">
                          View
                        </Button>
                      </Link>
                      {p.status === 'PENDING_REVIEW' ? (
                        <>
                          <Button
                            variant="primary"
                            size="sm"
                            disabled={busyId === p.id}
                            onClick={() => setDialog({ type: 'approve', id: p.id, name: p.businessName })}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="dangerOutline"
                            size="sm"
                            disabled={busyId === p.id}
                            onClick={() => {
                              setRejectReason('');
                              setDialog({ type: 'reject', id: p.id, name: p.businessName });
                            }}
                          >
                            Reject
                          </Button>
                        </>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={dialog?.type === 'approve'}
        title="Approve business profile"
        message={`Approve “${dialog?.type === 'approve' ? dialog.name : ''}”? This will mark the profile as approved and visible for the business flow.`}
        confirmLabel="Approve"
        onConfirm={() => void runApprove()}
        onCancel={() => setDialog(null)}
        loading={busyId != null}
      />

      <ConfirmDialog
        open={dialog?.type === 'reject'}
        title="Reject business profile"
        message={`Reject “${dialog?.type === 'reject' ? dialog.name : ''}”? Optionally add a short note for the owner.`}
        confirmLabel="Reject profile"
        onConfirm={() => void runReject()}
        onCancel={() => {
          setDialog(null);
          setRejectReason('');
        }}
        danger
        loading={busyId != null}
      >
        <label className="vb-field__label" htmlFor="reject-reason">
          Reason (optional)
        </label>
        <textarea
          id="reject-reason"
          className="vb-modal__textarea"
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="e.g. Incomplete description or invalid contact details"
          maxLength={500}
        />
      </ConfirmDialog>

      <ConfirmDialog
        open={dialog?.type === 'bulk-approve'}
        title="Bulk approve"
        message={`Approve ${selectedPendingIds.length} profile(s)? Non-pending rows are ignored by the server.`}
        confirmLabel="Approve all"
        onConfirm={() => void runBulkApprove()}
        onCancel={() => setDialog(null)}
        loading={busyId != null}
      />

      <ConfirmDialog
        open={dialog?.type === 'bulk-reject'}
        title="Bulk reject"
        message={`Reject ${selectedPendingIds.length} profile(s)? You can share one reason for all.`}
        confirmLabel="Reject all"
        onConfirm={() => void runBulkReject()}
        onCancel={() => {
          setDialog(null);
          setRejectReason('');
        }}
        danger
        loading={busyId != null}
      >
        <label className="vb-field__label" htmlFor="bulk-reject-reason">
          Reason (optional)
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
