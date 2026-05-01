import type { ReactNode } from 'react';
import { useCallback, useMemo, useRef, useState } from 'react';
import { ToastContext, type ToastVariant } from '@/components/ui/toastContext';

type ToastItem = {
  id: number;
  message: string;
  variant: ToastVariant;
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const showToast = useCallback((message: string, variant: ToastVariant = 'info') => {
    const id = ++idRef.current;
    setItems((prev) => [...prev, { id, message, variant }]);
    window.setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id));
    }, 4200);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="vb-toast-region" aria-live="polite">
        {items.map((t) => (
          <div key={t.id} className={`vb-toast vb-toast--${t.variant}`} role="status">
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
