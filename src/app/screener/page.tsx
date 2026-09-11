import type { Metadata } from 'next';
import Screener from '@/components/pages/Screener';

export const metadata: Metadata = {
  title: 'Equity Screener | SEEFIN Terminal',
  description: 'Real-time equity screener and market analytics',
};

export default function ScreenerPage() {
  return <Screener />;
}
