'use client';

import TerminalErrorView from '@/components/ui/TerminalErrorView';

export default function AuthError(props: {
  error: Error & { digest?: string };
  reset?: () => void;
  retry?: () => void;
}) {
  return <TerminalErrorView segment="AUTH" {...props} />;
}
