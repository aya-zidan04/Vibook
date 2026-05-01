import { createContext } from 'react';

export type AdminChromeContextValue = {
  headerSearch: string;
  setHeaderSearch: (q: string) => void;
};

export const AdminChromeContext = createContext<AdminChromeContextValue | null>(null);
