import type { PaperTradeRecord } from '@/types/trade';

const TRADE_KEY = 'seetrade.paperTrades.v1';
const SEARCH_PREFIX = 'seetrade.market.search.';

export const tradeStorage = {
  loadTrades(): PaperTradeRecord[] {
    try {
      if (typeof window === 'undefined') return [];
      return JSON.parse(localStorage.getItem(TRADE_KEY) ?? '[]') as PaperTradeRecord[];
    } catch {
      return [];
    }
  },
  saveTrades(trades: PaperTradeRecord[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TRADE_KEY, JSON.stringify(trades));
  },
  getSearch<T>(key: string): T | null {
    try {
      if (typeof window === 'undefined') return null;
      const payload = JSON.parse(localStorage.getItem(`${SEARCH_PREFIX}${key}`) ?? 'null') as { expiresAt: number; value: T } | null;
      if (!payload || payload.expiresAt <= Date.now()) return null;
      return payload.value;
    } catch {
      return null;
    }
  },
  setSearch(key: string, value: unknown, ttlMs: number): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(`${SEARCH_PREFIX}${key}`, JSON.stringify({
      expiresAt: Date.now() + ttlMs,
      value,
    }));
  },
};
