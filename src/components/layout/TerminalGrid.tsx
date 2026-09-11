'use client';

import React from 'react';

export type TerminalGridVariant =
  | 'auto-fit'
  | 'auto-fit-lg'
  | '2-col'
  | '3-col'
  | 'split-4-8'
  | 'split-7-5'
  | 'split-8-4'
  | 'dashboard'
  | 'stack';

type TerminalGridProps = {
  children: React.ReactNode;
  variant?: TerminalGridVariant;
  className?: string;
  /** Minimum width for auto-fit columns in pixels (default: 380) */
  minColWidth?: number;
};

/**
 * TerminalGrid is an auto-reorganizing grid system for institutional terminal pads.
 * When terminal pads are added or removed, it automatically redistributes space,
 * maintains hairline grid borders, and ensures balanced heights across columns.
 */
export default function TerminalGrid({
  children,
  variant = 'auto-fit',
  className = '',
  minColWidth = 380,
}: TerminalGridProps) {
  if (variant === 'stack') {
    return (
      <div className={`flex flex-col gap-px bg-zinc-800 border border-zinc-800 w-full flex-1 ${className}`}>
        {children}
      </div>
    );
  }

  if (variant === '2-col') {
    return (
      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-px bg-zinc-800 border border-zinc-800 w-full flex-1 ${className}`}>
        {children}
      </div>
    );
  }

  if (variant === '3-col') {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-px bg-zinc-800 border border-zinc-800 w-full flex-1 ${className}`}>
        {children}
      </div>
    );
  }

  if (variant === 'split-4-8') {
    return (
      <div className={`grid grid-cols-1 xl:grid-cols-12 gap-px bg-zinc-800 border border-zinc-800 w-full flex-1 ${className}`}>
        {children}
      </div>
    );
  }

  if (variant === 'split-7-5') {
    return (
      <div className={`grid grid-cols-1 xl:grid-cols-12 gap-px bg-zinc-800 border border-zinc-800 w-full flex-1 ${className}`}>
        {children}
      </div>
    );
  }

  if (variant === 'split-8-4') {
    return (
      <div className={`grid grid-cols-1 xl:grid-cols-12 gap-px bg-zinc-800 border border-zinc-800 w-full flex-1 ${className}`}>
        {children}
      </div>
    );
  }

  if (variant === 'dashboard') {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-6 xl:grid-cols-12 gap-px bg-zinc-800 border border-zinc-800 w-full flex-1 ${className}`}>
        {children}
      </div>
    );
  }

  if (variant === 'auto-fit-lg') {
    return (
      <div
        className={`grid gap-px bg-zinc-800 border border-zinc-800 w-full flex-1 ${className}`}
        style={{
          gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${Math.max(minColWidth, 480)}px), 1fr))`,
        }}
      >
        {children}
      </div>
    );
  }

  // Default: auto-fit
  return (
    <div
      className={`grid gap-px bg-zinc-800 border border-zinc-800 w-full flex-1 ${className}`}
      style={{
        gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${minColWidth}px), 1fr))`,
      }}
    >
      {children}
    </div>
  );
}
