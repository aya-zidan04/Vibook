import { useCallback, useEffect, useState } from 'react';
import { createGovernorate, fetchGovernorateStats, updateGovernorate } from '@/api/adminApi';
import type { GovernorateAdminStatsResponse } from '@/api/types';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { RoleBadge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/useToast';
import { useAdminI18n } from '@/i18n/useAdminI18n';
import { localizedGovernorateName } from '@/utils/governorateLabels';
import { getFriendlyErrorMessage } from '@/utils/apiError';

type FormState = {
  name: string;
  displayOrder: number;
  active: boolean;
};

function nextDisplayOrder(rows: GovernorateAdminStatsResponse[]): number {
  if (rows.length === 0) return 1;
  return Math.max(...rows.map((g) => g.displayOrder)) + 1;
}

export function GovernoratesPage() {
  const { t, locale } = useAdminI18n();
  const { showToast } = useToast();
  const [rows, setRows] = useState<GovernorateAdminStatsResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState<FormState>({ name: '', displayOrder: 1, active: true });
  const [saving, setSaving] = useState(false);

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

  function openCreate() {
    setForm({ name: '', displayOrder: nextDisplayOrder(rows), active: true });
    setCreateOpen(true);
  }

  async function submitCreate() {
    const name = form.name.trim();
    if (!name) {
      showToast(t('governorates.createFailed'), 'error');
      return;
    }
    setSaving(true);
    try {
      await createGovernorate({
        name,
        displayOrder: form.displayOrder,
        active: form.active,
      });
      showToast(t('governorates.createdToast'), 'success');
      setCreateOpen(false);
      await load();
    } catch (e) {
      showToast(getFriendlyErrorMessage(e, t('governorates.createFailed')), 'error');
    } finally {
      setSaving(false);
    }
  }

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
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--vb-space-md)', alignItems: 'flex-start', marginBottom: 'var(--vb-space-lg)' }}>
        <Button variant="primary" onClick={openCreate}>
          {t('governorates.addGovernorate')}
        </Button>
      </div>
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

      <Modal open={createOpen} title={t('governorates.createTitle')} onClose={() => setCreateOpen(false)} wide>
        <GovernorateCreateForm form={form} onChange={setForm} />
        <div className="vb-modal__actions" style={{ marginTop: 'var(--vb-space-lg)', justifyContent: 'flex-end' }}>
          <Button variant="ghost" onClick={() => setCreateOpen(false)} disabled={saving}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" onClick={() => void submitCreate()} disabled={saving || !form.name.trim()}>
            {saving ? t('common.saving') : t('governorates.create')}
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function GovernorateCreateForm({
  form,
  onChange,
}: {
  form: FormState;
  onChange: (f: FormState) => void;
}) {
  const { t } = useAdminI18n();

  return (
    <>
      <label className="vb-field__label" htmlFor="gov-name">
        {t('governorates.formName')}
      </label>
      <input
        id="gov-name"
        className="vb-input"
        value={form.name}
        onChange={(e) => onChange({ ...form, name: e.target.value })}
        maxLength={120}
      />
      <label className="vb-field__label" htmlFor="gov-order" style={{ marginTop: 'var(--vb-space-md)' }}>
        {t('governorates.formDisplayOrder')}
      </label>
      <input
        id="gov-order"
        className="vb-input"
        type="number"
        min={0}
        value={form.displayOrder}
        onChange={(e) => onChange({ ...form, displayOrder: Number(e.target.value) || 0 })}
      />
      <label className="vb-field__label" style={{ marginTop: 'var(--vb-space-md)', display: 'flex', gap: 8, alignItems: 'center' }}>
        <input
          type="checkbox"
          checked={form.active}
          onChange={(e) => onChange({ ...form, active: e.target.checked })}
        />
        {t('governorates.formActive')}
      </label>
    </>
  );
}
