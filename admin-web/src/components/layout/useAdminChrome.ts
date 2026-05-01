import { useContext } from 'react';
import { AdminChromeContext, type AdminChromeContextValue } from '@/components/layout/adminChromeContext';

export function useAdminChrome(): AdminChromeContextValue {
  const ctx = useContext(AdminChromeContext);
  if (!ctx) throw new Error('useAdminChrome must be used within AdminChromeProvider');
  return ctx;
}
