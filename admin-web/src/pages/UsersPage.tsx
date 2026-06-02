import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/auth/useAuth';
import {
  disableUserAccount,
  enableUserAccount,
  fetchAllUsers,
  updateUserRoles,
} from '@/api/adminApi';
import type { UserResponse } from '@/api/types';
import { useAdminChrome } from '@/components/layout/useAdminChrome';
import { RoleBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/useToast';
import { useAdminI18n } from '@/i18n/useAdminI18n';
import { getFriendlyErrorMessage } from '@/utils/apiError';
import { formatDateTime, formatFullName } from '@/utils/format';
import { formatRoles } from '@/utils/pageTitle';
import { userIsAdmin, withAdminRole } from '@/utils/userRoles';

type RoleFilter = 'ALL' | 'ADMIN' | 'BUSINESS' | 'USER_ONLY';
type StatusFilter = 'ALL' | 'ACTIVE' | 'DISABLED';

export function UsersPage() {
  const { t } = useAdminI18n();
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
  const [busyId, setBusyId] = useState<number | null>(null);
  const [confirmDisable, setConfirmDisable] = useState<UserResponse | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAllUsers();
      setRows(data);
    } catch (e) {
      setError(getFriendlyErrorMessage(e, t('users.loadError')));
    } finally {
      setLoading(false);
    }
  }, [t]);

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
      showToast(nextAdmin ? t('users.promoted') : t('users.demoted'), 'success');
    } catch (e) {
      showToast(getFriendlyErrorMessage(e, t('users.rolesFailed')), 'error');
    } finally {
      setBusyId(null);
    }
  }

  async function enableUser(u: UserResponse) {
    setBusyId(u.id);
    try {
      const updated = await enableUserAccount(u.id);
      mergeUser(updated);
      showToast(t('users.enabled'), 'success');
    } catch (e) {
      showToast(getFriendlyErrorMessage(e, t('users.enableFailed')), 'error');
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
      showToast(t('users.disabledToast'), 'success');
      setConfirmDisable(null);
    } catch (e) {
      showToast(getFriendlyErrorMessage(e, t('users.disableFailed')), 'error');
    } finally {
      setBusyId(null);
    }
  }

  const isSelf = (u: UserResponse) => currentUser?.id === u.id;

  if (error) {
    return (
      <div className="vb-page">
        <EmptyState title={t('users.unavailable')} description={error} decor />
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
                {[t('users.name'), t('users.email'), t('users.roles'), t('users.status'), t('users.created'), t('users.actions')].map((h) => (
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
          <label htmlFor="uf-role">{t('users.role')}</label>
          <select
            id="uf-role"
            className="vb-input"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as RoleFilter)}
          >
            <option value="ALL">{t('users.allRoles')}</option>
            <option value="ADMIN">{t('users.roleAdmin')}</option>
            <option value="BUSINESS">{t('users.roleBusiness')}</option>
            <option value="USER_ONLY">{t('users.roleUserOnly')}</option>
          </select>
        </div>
        <div className="vb-toolbar__field">
          <label htmlFor="uf-status">{t('users.status')}</label>
          <select
            id="uf-status"
            className="vb-input"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          >
            <option value="ALL">{t('users.allStatus')}</option>
            <option value="ACTIVE">{t('users.active')}</option>
            <option value="DISABLED">{t('users.disabled')}</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title={t('users.noUsers')}
          description={
            headerSearch.trim() || roleFilter !== 'ALL' || statusFilter !== 'ALL'
              ? t('users.noUsersFilter')
              : t('users.noUsersEmpty')
          }
          decor
        />
      ) : (
        <div className="vb-table-wrap">
          <table className="vb-table">
            <thead>
              <tr>
                {[t('users.name'), t('users.email'), t('users.roles'), t('users.status'), t('users.created'), t('users.actions')].map((h) => (
                  <th key={h}>{h}</th>
                ))}
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
                      {u.enabled ? t('users.active') : t('users.disabled')}
                    </span>
                  </td>
                  <td>{formatDateTime(u.createdAt)}</td>
                  <td>
                    <div className="vb-table-actions">
                      <Button variant="secondary" size="sm" onClick={() => setDetailUser(u)}>
                        {t('users.details')}
                      </Button>
                      {!isSelf(u) ? (
                        userIsAdmin(u.roles) ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={busyId === u.id}
                            onClick={() => void toggleAdmin(u)}
                          >
                            {t('users.removeAdmin')}
                          </Button>
                        ) : (
                          <Button
                            variant="secondary"
                            size="sm"
                            disabled={busyId === u.id}
                            onClick={() => void toggleAdmin(u)}
                          >
                            {t('users.makeAdmin')}
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
                            {t('users.disable')}
                          </Button>
                        ) : null
                      ) : (
                        <Button variant="primary" size="sm" disabled={busyId === u.id} onClick={() => void enableUser(u)}>
                          {t('users.enable')}
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
              <dt>{t('users.email')}</dt>
              <dd>{detailUser.email}</dd>
              <dt>{t('users.phone')}</dt>
              <dd>{detailUser.phone ?? t('common.dash')}</dd>
              <dt>{t('users.roles')}</dt>
              <dd>
                <RoleBadge label={formatRoles(detailUser.roles)} />
              </dd>
              <dt>{t('users.status')}</dt>
              <dd>{detailUser.enabled ? t('users.active') : t('users.disabled')}</dd>
              <dt>{t('users.joined')}</dt>
              <dd>{formatDateTime(detailUser.createdAt)}</dd>
              <dt>{t('users.updated')}</dt>
              <dd>{formatDateTime(detailUser.updatedAt)}</dd>
            </dl>
          </>
        ) : null}
      </Modal>

      <ConfirmDialog
        open={confirmDisable != null}
        title={t('users.disableTitle')}
        message={t('users.disableMsg', {
          name: confirmDisable ? formatFullName(confirmDisable.firstName, confirmDisable.lastName) : '',
        })}
        confirmLabel={t('users.disableConfirm')}
        onConfirm={() => void runDisable()}
        onCancel={() => setConfirmDisable(null)}
        danger
        loading={busyId != null}
      />
    </div>
  );
}
