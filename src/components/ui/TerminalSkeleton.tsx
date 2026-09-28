'use client';

import React from 'react';

type TerminalSkeletonProps = {
  variant?: 'dashboard' | 'table' | 'split' | 'grid';
  title?: string;
};

export default function TerminalSkeleton({
  variant = 'dashboard',
  title = 'TERMINAL_STREAM // SYNCHRONIZING',
}: TerminalSkeletonProps) {
  return (
    <div className="w-full min-h-full flex flex-col bg-black text-zinc-300 select-none animate-pulse">
      {/* Top Telemetry Scanning Bar */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 bg-zinc-950/80 px-3 py-1.5 text-[9px] font-mono text-zinc-500">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-sm bg-amber-500 animate-ping" />
          <span className="text-amber-500 font-bold uppercase tracking-widest">{title}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline text-zinc-600">INGESTION_RATE: 2.4 MB/S</span>
          <span className="text-zinc-600">BUFFER: 100%</span>
        </div>
      </div>

      {/* Body Skeleton Slices */}
      <div className="flex-1 p-2 md:p-3 flex flex-col gap-2">
        {variant === 'table' ? (
          <div className="border border-zinc-800/80 bg-black flex-1 flex flex-col min-h-[400px]">
            {/* Table Header Bar Skeleton */}
            <div className="h-8 border-b border-zinc-800/80 bg-zinc-950/60 flex items-center px-3 gap-3">
              <div className="w-20 h-2.5 bg-zinc-800/80 rounded-xs" />
              <div className="w-32 h-2.5 bg-zinc-800/60 rounded-xs" />
              <div className="w-24 h-2.5 bg-zinc-800/60 rounded-xs ml-auto" />
              <div className="w-16 h-2.5 bg-zinc-800/80 rounded-xs" />
            </div>
            {/* Table Row Skeletons */}
            <div className="flex-1 p-3 flex flex-col gap-2.5">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-zinc-900/60">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-3 bg-amber-500/20 rounded-xs" />
                    <div className="w-28 h-2.5 bg-zinc-800/60 rounded-xs" />
                  </div>
                  <div className="w-20 h-3 bg-zinc-800/80 rounded-xs" />
                  <div className="w-12 h-3 bg-zinc-800/60 rounded-xs" />
                </div>
              ))}
            </div>
          </div>
        ) : variant === 'split' ? (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-2 flex-1 min-h-[500px]">
            <div className="xl:col-span-5 border border-zinc-800/80 bg-black p-4 flex flex-col gap-4">
              <div className="h-6 w-36 bg-zinc-800/80 rounded-xs" />
              <div className="h-48 w-full bg-zinc-950/70 border border-zinc-850 rounded-xs flex items-center justify-center">
                <div className="w-24 h-24 rounded-full border-2 border-dashed border-zinc-800 animate-spin" />
              </div>
              <div className="space-y-2">
                <div className="h-3 w-full bg-zinc-900/80 rounded-xs" />
                <div className="h-3 w-4/5 bg-zinc-900/60 rounded-xs" />
              </div>
            </div>
            <div className="xl:col-span-7 border border-zinc-800/80 bg-black p-4 flex flex-col gap-3">
              <div className="h-6 w-48 bg-zinc-800/80 rounded-xs" />
              <div className="flex-1 flex flex-col gap-2 pt-2">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-9 w-full bg-zinc-950/60 border border-zinc-900/80 rounded-xs" />
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Default: Dual / Grid layout */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 flex-1 min-h-[480px]">
            <div className="border border-zinc-800/80 bg-black p-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="h-4 w-40 bg-zinc-800/80 rounded-xs" />
                <div className="h-3 w-64 bg-zinc-900/60 rounded-xs" />
                <div className="space-y-2 pt-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-8 w-full bg-zinc-950/60 border border-zinc-900/80 rounded-xs" />
                  ))}
                </div>
              </div>
              <div className="h-3 w-28 bg-zinc-900/60 rounded-xs mt-4" />
            </div>
            <div className="border border-zinc-800/80 bg-black p-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="h-4 w-40 bg-zinc-800/80 rounded-xs" />
                <div className="h-3 w-56 bg-zinc-900/60 rounded-xs" />
                <div className="space-y-2 pt-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-8 w-full bg-zinc-950/60 border border-zinc-900/80 rounded-xs" />
                  ))}
                </div>
              </div>
              <div className="h-3 w-28 bg-zinc-900/60 rounded-xs mt-4" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
