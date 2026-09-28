'use client';

import TerminalErrorView from '@/components/ui/TerminalErrorView';

export default function TestingTradeError(props: {
  error: Error & { digest?: string };
  reset?: () => void;
  retry?: () => void;
}) {
  return <TerminalErrorView segment="EQUITY_TRADE" {...props} />;
}
