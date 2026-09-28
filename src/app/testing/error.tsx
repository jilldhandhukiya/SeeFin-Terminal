'use client';

import TerminalErrorView from '@/components/ui/TerminalErrorView';

export default function TestingError(props: {
  error: Error & { digest?: string };
  reset?: () => void;
  retry?: () => void;
}) {
  return <TerminalErrorView segment="TESTING_ENVIRONMENT" {...props} />;
}
