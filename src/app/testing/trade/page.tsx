import type { Metadata } from 'next';
import TestingTrade from '@/components/pages/TestingTrade';

export const metadata: Metadata = {
  title: 'Paper Trading Desk | SEEFIN Terminal',
  description: 'SmartAPI and CoinDCX paper trading order ticket and blotter',
};

export default function TestingTradePage() {
  return <TestingTrade />;
}
