import { useCallback, useEffect, useState } from 'react';
import {
  createAdminCategory,
  deleteAdminCategory,
  fetchAdminCategories,
  updateAdminCategory,
} from '@/api/adminApi';
import type { CategoryAdminResponse } from '@/api/types';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Modal } from '@/components/ui/Modal';
import { RoleBadge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/useToast';
import { getFriendlyErrorMessage } from '@/utils/apiError';

type FormState = {
  name: string;
  slug: string;
  icon: string;
  active: boolean;
};

const emptyForm: FormState = { name: '', slug: '', icon: '', active: true };

function slugifyHint(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function CategoriesPage() {
  const { showToast } = useToast();
  const [rows, setRows] = useState<CategoryAdminResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editRow, setEditRow] = useState<CategoryAdminResponse | null>(null);
  const [deleteRow, setDeleteRow] = useState<CategoryAdminResponse | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminCategories();
      setRows(data);
    } catch (e) {
      setError(getFriendlyErrorMessage(e, 'Could not load categories.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function openCreate() {
    setForm(emptyForm);
    setCreateOpen(true);
  }

  function openEdit(c: CategoryAdminResponse) {
    setEditRow(c);
    setForm({
      name: c.name,
      slug: c.slug,
      icon: c.icon ?? '',
      active: c.active,
    });
  }

  async function submitCreate() {
    setSaving(true);
    try {
      await createAdminCategory({
        name: form.name.trim(),
        slug: form.slug.trim(),
        icon: form.icon.trim() || undefined,
        active: form.active,
      });
      showToast('Category created.', 'success');
      setCreateOpen(false);
      setForm(emptyForm);
      await load();
    } catch (e) {
      showToast(getFriendlyErrorMessage(e, 'Create failed.'), 'error');
    } finally {
      setSaving(false);
    }
  }

  async function submitEdit() {
    if (!editRow) return;
    setSaving(true);
    try {
      await updateAdminCategory(editRow.id, {
        name: form.name.trim(),
        slug: form.slug.trim(),
        icon: form.icon.trim() || undefined,
        active: form.active,
      });
      showToast('Category updated.', 'success');
      setEditRow(null);
      await load();
    } catch (e) {
      showToast(getFriendlyErrorMessage(e, 'Update failed.'), 'error');
    } finally {
      setSaving(false);
    }
  }

  async function runDelete() {
    if (!deleteRow) return;
    setSaving(true);
    try {
      await deleteAdminCategory(deleteRow.id);
      showToast('Category deleted.', 'success');
      setDeleteRow(null);
      await load();
    } catch (e) {
      showToast(getFriendlyErrorMessage(e, 'Delete failed (may still be in use).'), 'error');
    } finally {
      setSaving(false);
    }
  }

  if (error) {
    return (
      <div className="vb-page">
        <EmptyState title="Categories unavailable" description={error} decor />
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
                {['Name', 'Slug', 'Usage', 'Icon', 'Active', 'Actions'].map((h) => (
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
      </div>
    );
  }

  return (
    <div className="vb-page">
      <div style={{ marginBottom: 'var(--vb-space-lg)' }}>
        <Button variant="primary" onClick={openCreate}>
          New category
        </Button>
      </div>

      {rows.length === 0 ? (
        <EmptyState title="No categories" description="Create a category to get started." decor />
      ) : (
        <div className="vb-table-wrap">
          <table className="vb-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th>Usage</th>
                <th>Icon</th>
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id}>
                  <td>
                    <strong>{c.name}</strong>
                  </td>
                  <td className="vb-muted">{c.slug}</td>
                  <td>{c.usageCount}</td>
                  <td>{c.icon || '—'}</td>
                  <td>
                    <RoleBadge label={c.active ? 'Yes' : 'No'} />
                  </td>
                  <td>
                    <div className="vb-table-actions">
                      <Button variant="secondary" size="sm" onClick={() => openEdit(c)}>
                        Edit
                      </Button>
                      <Button
                        variant="dangerOutline"
                        size="sm"
                        disabled={c.usageCount > 0}
                        title={c.usageCount > 0 ? 'In use — remove from businesses first' : undefined}
                        onClick={() => setDeleteRow(c)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={createOpen} title="New category" onClose={() => setCreateOpen(false)} wide>
        <CategoryForm
          form={form}
          onChange={setForm}
          slugHint={slugifyHint(form.name)}
          onAutofillSlug={() => setForm((f) => ({ ...f, slug: slugifyHint(f.name) }))}
        />
        <div className="vb-modal__actions" style={{ marginTop: 'var(--vb-space-lg)', justifyContent: 'flex-end' }}>
          <Button variant="ghost" onClick={() => setCreateOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => void submitCreate()} disabled={saving}>
            {saving ? 'Saving…' : 'Create'}
          </Button>
        </div>
      </Modal>

      <Modal
        open={editRow != null}
        title={editRow ? `Edit ${editRow.name}` : ''}
        onClose={() => setEditRow(null)}
        wide
      >
        <CategoryForm
          form={form}
          onChange={setForm}
          slugHint={slugifyHint(form.name)}
          onAutofillSlug={() => setForm((f) => ({ ...f, slug: slugifyHint(f.name) }))}
        />
        <div className="vb-modal__actions" style={{ marginTop: 'var(--vb-space-lg)', justifyContent: 'flex-end' }}>
          <Button variant="ghost" onClick={() => setEditRow(null)} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => void submitEdit()} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteRow != null}
        title="Delete category"
        message={`Delete “${deleteRow?.name ?? ''}”? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={() => void runDelete()}
        onCancel={() => setDeleteRow(null)}
        danger
        loading={saving}
      />
    </div>
  );
}

function CategoryForm({
  form,
  onChange,
  slugHint,
  onAutofillSlug,
}: {
  form: FormState;
  onChange: (f: FormState) => void;
  slugHint: string;
  onAutofillSlug: () => void;
}) {
  return (
    <>
      <label className="vb-field__label" htmlFor="cat-name">
        Name
      </label>
      <input
        id="cat-name"
        className="vb-input"
        value={form.name}
        onChange={(e) => onChange({ ...form, name: e.target.value })}
        maxLength={120}
      />
      <label className="vb-field__label" htmlFor="cat-slug" style={{ marginTop: 'var(--vb-space-md)' }}>
        Slug (kebab-case)
      </label>
      <div style={{ display: 'flex', gap: 'var(--vb-space-sm)', alignItems: 'center' }}>
        <input
          id="cat-slug"
          className="vb-input"
          value={form.slug}
          onChange={(e) => onChange({ ...form, slug: e.target.value })}
          maxLength={80}
        />
        <Button type="button" variant="secondary" size="sm" onClick={onAutofillSlug}>
          From name
        </Button>
      </div>
      <p className="vb-field__hint">Suggested: {slugHint || '—'}</p>
      <label className="vb-field__label" htmlFor="cat-icon" style={{ marginTop: 'var(--vb-space-md)' }}>
        Icon key (optional)
      </label>
      <input
        id="cat-icon"
        className="vb-input"
        value={form.icon}
        onChange={(e) => onChange({ ...form, icon: e.target.value })}
        maxLength={64}
      />
      <label className="vb-field__label" style={{ marginTop: 'var(--vb-space-md)', display: 'flex', gap: 8, alignItems: 'center' }}>
        <input
          type="checkbox"
          checked={form.active}
          onChange={(e) => onChange({ ...form, active: e.target.checked })}
        />
        Active
      </label>
    </>
  );
}
