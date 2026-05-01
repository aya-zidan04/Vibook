import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/auth/useAuth';
import {
  disableUserAccount,
  enableUserAccount,
  fetchActivityLog,
  fetchAllUsers,
  updateUserRoles,
} from '@/api/adminApi';
import type { AdminActivityLogResponse, UserResponse } from '@/api/types';
import { useAdminChrome } from '@/components/layout/useAdminChrome';
import { RoleBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/useToast';
import { activityActionLabel } from '@/utils/activityLogLabel';
import { getFriendlyErrorMessage } from '@/utils/apiError';
import { formatDateTime, formatFullName } from '@/utils/format';
import { formatRoles } from '@/utils/pageTitle';
import { userIsAdmin, withAdminRole } from '@/utils/userRoles';

type RoleFilter = 'ALL' | 'ADMIN' | 'BUSINESS' | 'USER_ONLY';
type StatusFilter = 'ALL' | 'ACTIVE' | 'DISABLED';

export function UsersPage() {
  const { user: currentUser } = useAuth();
  const { headerSearch } = useAdminChrome();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [rows, setRows] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('ALL');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [detailUser, setDetailUser] = useState<UserResponse | null>(null);
  const [detailLog, setDetailLog] = useState<AdminActivityLogResponse[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [confirmDisable, setConfirmDisable] = useState<UserResponse | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAllUsers();
      setRows(data);
    } catch (e) {
      setError(getFriendlyErrorMessage(e, 'Could not load users.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const openUserIdParam = searchParams.get('userId');

  useEffect(() => {
    if (!openUserIdParam || rows.length === 0) return;
    const id = Number(openUserIdParam);
    if (!Number.isFinite(id)) return;
    const u = rows.find((r) => r.id === id);
    if (u) {
      setDetailUser(u);
      const next = new URLSearchParams(searchParams);
      next.delete('userId');
      setSearchParams(next, { replace: true });
    }
  }, [openUserIdParam, rows, searchParams, setSearchParams]);

  useEffect(() => {
    if (!detailUser) {
      setDetailLog([]);
      return;
    }
    let cancelled = false;
    (async () => {
      setDetailLoading(true);
      try {
        const page = await fetchActivityLog({ page: 0, size: 25, entityType: 'USER', entityId: detailUser.id });
        if (!cancelled) setDetailLog(page.content);
      } catch {
        if (!cancelled) setDetailLog([]);
      } finally {
        if (!cancelled) setDetailLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [detailUser]);

  const filtered = useMemo(() => {
    let list = rows;
    const q = headerSearch.trim().toLowerCase();
    if (q) {
      list = list.filter((u) => {
        const name = `${u.firstName} ${u.lastName}`.toLowerCase();
        return name.includes(q) || u.email.toLowerCase().includes(q);
      });
    }
    if (roleFilter === 'ADMIN') list = list.filter((u) => u.roles.includes('ROLE_ADMIN'));
    else if (roleFilter === 'BUSINESS') list = list.filter((u) => u.roles.includes('ROLE_BUSINESS'));
    else if (roleFilter === 'USER_ONLY')
      list = list.filter((u) => u.roles.includes('ROLE_USER') && !u.roles.includes('ROLE_ADMIN'));
    if (statusFilter === 'ACTIVE') list = list.filter((u) => u.enabled);
    if (statusFilter === 'DISABLED') list = list.filter((u) => !u.enabled);
    return list;
  }, [rows, headerSearch, roleFilter, statusFilter]);

  function mergeUser(updated: UserResponse) {
    setRows((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    setDetailUser((d) => (d && d.id === updated.id ? updated : d));
  }

  async function toggleAdmin(u: UserResponse) {
    const nextAdmin = !userIsAdmin(u.roles);
    setBusyId(u.id);
    try {
      const updated = await updateUserRoles(u.id, withAdminRole(u.roles, nextAdmin));
      mergeUser(updated);
      showToast(nextAdmin ? 'User promoted to admin.' : 'Admin role removed.', 'success');
    } catch (e) {
      showToast(getFriendlyErrorMessage(e, 'Could not update roles.'), 'error');
    } finally {
      setBusyId(null);
    }
  }

  async function enableUser(u: UserResponse) {
    setBusyId(u.id);
    try {
      const updated = await enableUserAccount(u.id);
      mergeUser(updated);
      showToast('User enabled.', 'success');
    } catch (e) {
      showToast(getFriendlyErrorMessage(e, 'Enable failed.'), 'error');
    } finally {
      setBusyId(null);
    }
  }

  async function runDisable() {
    if (!confirmDisable) return;
    setBusyId(confirmDisable.id);
    try {
      await disableUserAccount(confirmDisable.id);
      mergeUser({ ...confirmDisable, enabled: false });
      showToast('User disabled.', 'success');
      setConfirmDisable(null);
    } catch (e) {
      showToast(getFriendlyErrorMessage(e, 'Disable failed.'), 'error');
    } finally {
      setBusyId(null);
    }
  }

  const isSelf = (u: UserResponse) => currentUser?.id === u.id;

  if (error) {
    return (
      <div className="vb-page">
        <EmptyState title="Users unavailable" description={error} decor />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="vb-page">
        <div className="vb-table-wrap">
          <table className="vb-table">
            <thead>
              <tr>
                {['Name', 'Email', 'Roles', 'Status', 'Created', 'Actions'].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 8 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={6}>
                    <div className="vb-skeleton" style={{ height: 20 }} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="vb-page">
      <div className="vb-toolbar">
        <div className="vb-toolbar__field">
          <label htmlFor="uf-role">Role</label>
          <select
            id="uf-role"
            className="vb-input"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as RoleFilter)}
          >
            <option value="ALL">All roles</option>
            <option value="ADMIN">Admin</option>
            <option value="BUSINESS">Business</option>
            <option value="USER_ONLY">User (non-admin)</option>
          </select>
        </div>
        <div className="vb-toolbar__field">
          <label htmlFor="uf-status">Status</label>
          <select
            id="uf-status"
            className="vb-input"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          >
            <option value="ALL">All</option>
            <option value="ACTIVE">Active</option>
            <option value="DISABLED">Disabled</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No users found"
          description={
            headerSearch.trim() || roleFilter !== 'ALL' || statusFilter !== 'ALL'
              ? 'Try adjusting filters or search.'
              : 'There are no registered users in the database.'
          }
          decor
        />
      ) : (
        <div className="vb-table-wrap">
          <table className="vb-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Roles</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id}>
                  <td>
                    <strong>{formatFullName(u.firstName, u.lastName)}</strong>
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <RoleBadge label={formatRoles(u.roles)} />
                  </td>
                  <td>
                    <span className={`vb-badge ${u.enabled ? 'vb-badge--approved' : 'vb-badge--rejected'}`}>
                      {u.enabled ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td>{formatDateTime(u.createdAt)}</td>
                  <td>
                    <div className="vb-table-actions">
                      <Button variant="secondary" size="sm" onClick={() => setDetailUser(u)}>
                        Details
                      </Button>
                      {!isSelf(u) ? (
                        userIsAdmin(u.roles) ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={busyId === u.id}
                            onClick={() => void toggleAdmin(u)}
                          >
                            Remove admin
                          </Button>
                        ) : (
                          <Button
                            variant="secondary"
                            size="sm"
                            disabled={busyId === u.id}
                            onClick={() => void toggleAdmin(u)}
                          >
                            Make admin
                          </Button>
                        )
                      ) : null}
                      {u.enabled ? (
                        !isSelf(u) ? (
                          <Button
                            variant="dangerOutline"
                            size="sm"
                            disabled={busyId === u.id}
                            onClick={() => setConfirmDisable(u)}
                          >
                            Disable
                          </Button>
                        ) : null
                      ) : (
                        <Button variant="primary" size="sm" disabled={busyId === u.id} onClick={() => void enableUser(u)}>
                          Enable
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={detailUser != null}
        title={detailUser ? formatFullName(detailUser.firstName, detailUser.lastName) : ''}
        wide
        onClose={() => setDetailUser(null)}
      >
        {detailUser ? (
          <>
            <dl className="vb-dl">
              <dt>Email</dt>
              <dd>{detailUser.email}</dd>
              <dt>Phone</dt>
              <dd>{detailUser.phone ?? '—'}</dd>
              <dt>Roles</dt>
              <dd>
                <RoleBadge label={formatRoles(detailUser.roles)} />
              </dd>
              <dt>Status</dt>
              <dd>{detailUser.enabled ? 'Active' : 'Disabled'}</dd>
              <dt>Joined</dt>
              <dd>{formatDateTime(detailUser.createdAt)}</dd>
              <dt>Updated</dt>
              <dd>{formatDateTime(detailUser.updatedAt)}</dd>
            </dl>
            <h4 style={{ margin: 'var(--vb-space-xl) 0 var(--vb-space-sm)' }}>Recent admin activity</h4>
            {detailLoading ? (
              <div className="vb-skeleton" style={{ height: 60 }} />
            ) : detailLog.length === 0 ? (
              <p className="vb-muted" style={{ margin: 0 }}>
                No logged actions for this user yet.
              </p>
            ) : (
              <ul className="vb-rank-list">
                {detailLog.map((e) => (
                  <li key={e.id}>
                    <div>
                      <div className="vb-rank-list__name">{activityActionLabel(e.action)}</div>
                      <div className="vb-muted" style={{ fontSize: '0.8125rem' }}>
                        {e.adminEmail} · {formatDateTime(e.createdAt)}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : null}
      </Modal>

      <ConfirmDialog
        open={confirmDisable != null}
        title="Disable user"
        message={`Disable “${confirmDisable ? formatFullName(confirmDisable.firstName, confirmDisable.lastName) : ''}”? They will not be able to sign in.`}
        confirmLabel="Disable account"
        onConfirm={() => void runDisable()}
        onCancel={() => setConfirmDisable(null)}
        danger
        loading={busyId != null}
      />
    </div>
  );
}
