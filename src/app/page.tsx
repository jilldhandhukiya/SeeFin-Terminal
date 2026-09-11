import type { Metadata } from 'next';
import Dashboard from '@/components/pages/Dashboard';

export const metadata: Metadata = {
  title: 'Dashboard // Market Monitor',
  description: 'Real-time financial market overview, indices, equity trends, and live wire news stream.',
};

export default function HomePage() {
  return <Dashboard />;
}
