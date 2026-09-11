'use client';

import TerminalErrorView from '@/components/ui/TerminalErrorView';

export default function AssetsError(props: {
  error: Error & { digest?: string };
  reset?: () => void;
  retry?: () => void;
}) {
  return <TerminalErrorView segment="ASSETS" {...props} />;
}
