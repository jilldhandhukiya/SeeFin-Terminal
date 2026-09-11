import type { Metadata } from 'next';
import Ledger from '@/components/pages/Ledger';

export const metadata: Metadata = {
  title: 'Ledger | SEEFIN Terminal',
  description: 'General ledger and debit transaction register',
};

export default function LedgerPage() {
  return <Ledger />;
}
