import type { ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { useAdminI18n } from '@/i18n/useAdminI18n';

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  danger,
  loading,
  onConfirm,
  onCancel,
  children,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  children?: ReactNode;
}) {
  const { t } = useAdminI18n();
  const resolvedCancel = cancelLabel ?? t('common.cancel');

  if (!open) return null;
  return (
    <div className="vb-modal-root" role="presentation">
      <button
        type="button"
        className="vb-modal-backdrop"
        aria-label={t('dialog.closeBackdropAria')}
        onClick={onCancel}
      />
      <div className="vb-modal" role="dialog" aria-modal="true" aria-labelledby="vb-confirm-title">
        <h2 id="vb-confirm-title" className="vb-modal__title">
          {title}
        </h2>
        <p className="vb-modal__message">{message}</p>
        {children}
        <div className="vb-modal__actions">
          <Button variant="ghost" onClick={onCancel} disabled={loading}>
            {resolvedCancel}
          </Button>
          <Button
            variant={danger ? 'danger' : 'primary'}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? t('common.pleaseWait') : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
