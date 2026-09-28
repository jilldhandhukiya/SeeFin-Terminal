'use client';

import TerminalErrorView from '@/components/ui/TerminalErrorView';

export default function ErrorBoundary(props: {
  error: Error & { digest?: string };
  reset?: () => void;
  retry?: () => void;
}) {
  return <TerminalErrorView segment="ROOT_MONITOR" {...props} />;
}
