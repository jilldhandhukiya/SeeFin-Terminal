'use client';

import TerminalErrorView from '@/components/ui/TerminalErrorView';

export default function TestingTradeFNOError(props: {
  error: Error & { digest?: string };
  reset?: () => void;
  retry?: () => void;
}) {
  return <TerminalErrorView segment="FNO_TRADE" {...props} />;
}
