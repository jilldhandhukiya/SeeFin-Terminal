import type { Metadata } from 'next';
import Wire from '@/components/pages/Wire';

export const metadata: Metadata = {
  title: 'Global Wire & Intelligence | SEEFIN Terminal',
  description: 'Encrypted intelligence feed and TradingView economic calendar',
};

export default function WirePage() {
  return <Wire />;
}
