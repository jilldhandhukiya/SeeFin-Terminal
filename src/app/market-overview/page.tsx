import type { Metadata } from 'next';
import MarketOverview from '@/components/pages/MarketOverview';

export const metadata: Metadata = {
  title: 'World Market Timing & Holidays | SEEFIN Terminal',
  description: 'Interactive global market session map and holiday-aware trading calendar',
};

export default function MarketOverviewPage() {
  return <MarketOverview />;
}
