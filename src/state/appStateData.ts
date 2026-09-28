import { createContext, useContext } from 'react';

export type ExpenseItem = {
  id: string | number;
  code: string;
  name: string;
  amount: number;
  category: string;
  date: string;
  status: string;
};

export type AssetItem = {
  id: string;
  symbol: string;
  name: string;
  type: string;
  value: number;
  change: number;
  allocation: number;
};

export type AppStateValue = {
  time?: string;
  expenses: ExpenseItem[];
  assets: AssetItem[];
  addExpense: (expense: Omit<ExpenseItem, 'id'> & { id?: string | number }) => void;
  deleteExpense: (id: string | number) => void;
};

export const INITIAL_EXPENSES: ExpenseItem[] = [
  { id: '1', code: 'TRN-001', name: 'GULFSTREAM MAINT', amount: 15000, category: 'LOGISTICS', date: '2025-11-01', status: 'CLEARED' },
  { id: '2', code: 'LIF-092', name: 'CONCIERGE RETAINER', amount: 2500, category: 'SERVICES', date: '2025-11-03', status: 'PENDING' },
  { id: '3', code: 'RES-404', name: 'PENTHOUSE LEASE', amount: 12000, category: 'HOUSING', date: '2025-11-05', status: 'CLEARED' },
  { id: '4', code: 'SEC-112', name: 'SECURITY DETAIL', amount: 4500, category: 'PROTECTION', date: '2025-11-06', status: 'CLEARED' },
];

export const INITIAL_ASSETS: AssetItem[] = [
  { id: '1', symbol: 'BRK.A', name: 'BERKSHIRE HATHAWAY', type: 'EQTY', value: 450000, change: 12.5, allocation: 35 },
  { id: '2', symbol: 'XAU', name: 'GOLD BULLION', type: 'CMDTY', value: 125000, change: 4.2, allocation: 15 },
  { id: '3', symbol: 'KY-TR', name: 'OFFSHORE TRUST', type: 'FX', value: 800000, change: 0.5, allocation: 50 },
];

export const AppStateContext = createContext<AppStateValue | null>(null);

export const useAppState = () => {
  const context = useContext(AppStateContext);

  if (!context) {
    throw new Error('useAppState must be used within AppStateProvider');
  }

  return context;
};
