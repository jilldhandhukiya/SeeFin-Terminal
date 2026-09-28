import type { Metadata } from 'next';
import TestingTradeFNO from '@/components/pages/TestingTradeFNO';

export const metadata: Metadata = {
  title: 'F&O Option Chain',
  description: 'Derivatives option chain board, Greeks, and active contracts',
};

export default function TestingTradeFNOPage() {
  return <TestingTradeFNO />;
}
