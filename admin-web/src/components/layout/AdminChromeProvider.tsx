import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { AdminChromeContext } from '@/components/layout/adminChromeContext';

export function AdminChromeProvider({ children }: { children: ReactNode }) {
  const [headerSearch, setHeaderSearch] = useState('');
  const value = useMemo(() => ({ headerSearch, setHeaderSearch }), [headerSearch]);
  return <AdminChromeContext.Provider value={value}>{children}</AdminChromeContext.Provider>;
}
