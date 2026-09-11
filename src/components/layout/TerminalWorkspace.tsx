'use client';

import React from 'react';

type TerminalWorkspaceProps = {
  children: React.ReactNode;
  className?: string;
  /** Optional top banner / stats bar */
  banner?: React.ReactNode;
};

/**
 * TerminalWorkspace provides a unified institutional canvas for all terminal views.
 * It enforces pure-black background, seamless page-level scrollability, and zero visual voids.
 */
export default function TerminalWorkspace({
  children,
  className = '',
  banner,
}: TerminalWorkspaceProps) {
  return (
    <div className={`w-full min-h-full flex flex-col bg-black text-gray-300 ${className}`}>
      {banner && <div className="shrink-0">{banner}</div>}
      <div className="flex-1 flex flex-col min-h-0 w-full">
        {children}
      </div>
    </div>
  );
}
