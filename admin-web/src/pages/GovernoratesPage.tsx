import { useCallback, useEffect, useState } from 'react';
import { fetchGovernorateStats, updateGovernorate } from '@/api/adminApi';
import type { GovernorateAdminStatsResponse } from '@/api/types';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { RoleBadge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/useToast';
import { getFriendlyErrorMessage } from '@/utils/apiError';

export function GovernoratesPage() {
  const { showToast } = useToast();
  const [rows, setRows] = useState<GovernorateAdminStatsResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchGovernorateStats();
      setRows(data);
    } catch (e) {
      setError(getFriendlyErrorMessage(e, 'Could not load governorates.'));
    } finally {
      setLoading(false);
    }
  }, []);

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
      showToast(g.active ? 'Governorate hidden from active lists.' : 'Governorate activated.', 'success');
      await load();
    } catch (e) {
      showToast(getFriendlyErrorMessage(e, 'Update failed.'), 'error');
    } finally {
      setBusyId(null);
    }
  }

  if (error) {
    return (
      <div className="vb-page">
        <EmptyState title="Governorates unavailable" description={error} decor />
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
                {['Name', 'Businesses', 'Display order', 'Active', 'Actions'].map((h) => (
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
        All governorates with business counts. Toggling active updates the public directory; existing businesses keep
        their region reference.
      </p>
      {rows.length === 0 ? (
        <EmptyState title="No governorates" description="Seed data may be missing." decor />
      ) : (
        <div className="vb-table-wrap">
          <table className="vb-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Businesses</th>
                <th>Display order</th>
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((g) => (
                <tr key={g.id}>
                  <td>
                    <strong>{g.name}</strong>
                  </td>
                  <td>{g.businessCount}</td>
                  <td>{g.displayOrder}</td>
                  <td>
                    <RoleBadge label={g.active ? 'Yes' : 'No'} />
                  </td>
                  <td>
                    <Button
                      variant={g.active ? 'dangerOutline' : 'primary'}
                      size="sm"
                      disabled={busyId === g.id}
                      onClick={() => void toggleActive(g)}
                    >
                      {g.active ? 'Deactivate' : 'Activate'}
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
