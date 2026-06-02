import type { ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { useAdminI18n } from '@/i18n/useAdminI18n';

export function Modal({
  open,
  title,
  onClose,
  children,
  wide,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  const { t } = useAdminI18n();

  if (!open) return null;
  return (
    <div className="vb-modal-root" role="presentation">
      <button type="button" className="vb-modal-backdrop" aria-label={t('modal.closeAria')} onClick={onClose} />
      <div
        className={`vb-modal ${wide ? 'vb-modal--wide' : ''}`.trim()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="vb-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="vb-modal__head">
          <h2 id="vb-modal-title" className="vb-modal__title vb-modal__title--plain">
            {title}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            {t('modal.close')}
          </Button>
        </div>
        <div className="vb-modal__body">{children}</div>
      </div>
    </div>
  );
}
