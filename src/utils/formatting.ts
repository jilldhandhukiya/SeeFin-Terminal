import { LOCALE, CURRENCY } from '@/config/currency';

const currencyFormatter = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: CURRENCY,
  minimumFractionDigits: 2,
});

const compactFormatter = new Intl.NumberFormat(LOCALE, {
  notation: 'compact',
  maximumFractionDigits: 1,
});

export const formatCurrency = (amount: number) => currencyFormatter.format(amount);

export const formatCompact = (amount: number) => compactFormatter.format(amount);

export const getCurrentTime = (): string => {
  return new Date().toLocaleTimeString(LOCALE, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};
