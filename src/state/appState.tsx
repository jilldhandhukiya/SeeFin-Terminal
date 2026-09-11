'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { getCurrentTime } from '@/utils/formatting';
import { AppStateContext, INITIAL_ASSETS, INITIAL_EXPENSES, type AppStateValue, type AssetItem, type ExpenseItem } from './appStateData';

export const AppStateProvider = ({ children }: { children: ReactNode }) => {
  const [time, setTime] = useState<string>('--:--:--');
  const [expenses, setExpenses] = useState<ExpenseItem[]>(INITIAL_EXPENSES);
  const [assets] = useState<AssetItem[]>(INITIAL_ASSETS);

  useEffect(() => {
    const timer = setTimeout(() => setTime(getCurrentTime()), 0);
    const interval = setInterval(() => setTime(getCurrentTime()), 1000);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  const value = useMemo<AppStateValue>(() => ({
    time,
    expenses,
    assets,
    addExpense: (expense) => {
      setExpenses((previous) => [...previous, { ...expense, id: expense.id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}` }]);
    },
    deleteExpense: (id) => {
      setExpenses((previous) => previous.filter((expense) => expense.id !== id));
    },
  }), [time, expenses, assets]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
};
