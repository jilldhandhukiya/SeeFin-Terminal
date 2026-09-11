import type { Metadata } from 'next';
import Settings from '@/components/pages/Settings';

export const metadata: Metadata = {
  title: 'System Settings | SEEFIN Terminal',
  description: 'Terminal UI preferences, connectivity, and operator management',
};

export default function SettingsPage() {
  return <Settings />;
}
