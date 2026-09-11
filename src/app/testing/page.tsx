import type { Metadata } from 'next';
import Testing from '@/components/pages/Testing';

export const metadata: Metadata = {
  title: 'Testing Console | SEEFIN Terminal',
  description: 'Trade testing console, backtesting launchpad, and risk desk',
};

export default function TestingPage() {
  return <Testing />;
}
