import { useCallback, useEffect, useState } from 'react';
import { fetchGovernorateStats, updateGovernorate } from '@/api/adminApi';
import type { GovernorateAdminStatsResponse } from '@/api/types';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { RoleBadge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/useToast';
import { useAdminI18n } from '@/i18n/useAdminI18n';
import { localizedGovernorateName } from '@/utils/governorateLabels';
import { getFriendlyErrorMessage } from '@/utils/apiError';

export function GovernoratesPage() {
  const { t, locale } = useAdminI18n();
  const { showToast } = useToast();
  const [rows, setRows] = useState<GovernorateAdminStatsResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const tableHeaders = [
    t('table.name'),
    t('table.businesses'),
    t('table.displayOrder'),
    t('table.active'),
    t('table.actions'),
  ];

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchGovernorateStats();
      setRows(data);
    } catch (e) {
      setError(getFriendlyErrorMessage(e, t('governorates.loadError')));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  async function toggleActive(g: GovernorateAdminStatsResponse) {
    setBusyId(g.id);
    try {
      await updateGovernorate(g.id, {
        name: g.name,
        displayOrder: g.displayOrder,
        active: !g.active,
      });
      showToast(g.active ? t('governorates.hiddenToast') : t('governorates.activatedToast'), 'success');
      await load();
    } catch (e) {
      showToast(getFriendlyErrorMessage(e, t('governorates.updateFailed')), 'error');
    } finally {
      setBusyId(null);
    }
  }

  if (error) {
    return (
      <div className="vb-page">
        <EmptyState title={t('governorates.unavailable')} description={error} decor />
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
                {tableHeaders.map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={5}>
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
      <p className="vb-muted" style={{ marginTop: 0, maxWidth: 560 }}>
        {t('governorates.intro')}
      </p>
      {rows.length === 0 ? (
        <EmptyState title={t('governorates.noGovernorates')} description={t('governorates.noGovernoratesDesc')} decor />
      ) : (
        <div className="vb-table-wrap">
          <table className="vb-table">
            <thead>
              <tr>
                {tableHeaders.map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((g) => (
                <tr key={g.id}>
                  <td>
                    <strong>{localizedGovernorateName(g.name, locale)}</strong>
                  </td>
                  <td>{g.businessCount}</td>
                  <td>{g.displayOrder}</td>
                  <td>
                    <RoleBadge label={g.active ? t('yesNo.yes') : t('yesNo.no')} />
                  </td>
                  <td>
                    <Button
                      variant={g.active ? 'dangerOutline' : 'primary'}
                      size="sm"
                      disabled={busyId === g.id}
                      onClick={() => void toggleActive(g)}
                    >
                      {g.active ? t('governorates.deactivate') : t('governorates.activate')}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
