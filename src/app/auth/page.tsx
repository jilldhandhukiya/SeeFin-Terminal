import type { Metadata } from 'next';
import Auth from '@/components/pages/Auth';

export const metadata: Metadata = {
  title: 'Terminal Authentication | SEEFIN Terminal',
  description: 'Operator authentication and session access vault',
};

export default function AuthPage() {
  return <Auth />;
}
