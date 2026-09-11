'use client';

import TerminalErrorView from '@/components/ui/TerminalErrorView';

export default function MarketOverviewError(props: {
  error: Error & { digest?: string };
  reset?: () => void;
  retry?: () => void;
}) {
  return <TerminalErrorView segment="MARKET_OVERVIEW" {...props} />;
}
