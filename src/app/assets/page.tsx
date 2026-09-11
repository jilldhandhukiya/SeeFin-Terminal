import type { Metadata } from 'next';
import Assets from '@/components/pages/Assets';

export const metadata: Metadata = {
  title: 'Portfolio & Assets | SEEFIN Terminal',
  description: 'Multi-asset portfolio allocation matrix and risk analysis',
};

export default function AssetsPage() {
  return <Assets />;
}
