'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, ArrowLeft, RefreshCcw, Terminal } from 'lucide-react';

export type TerminalErrorProps = {
  segment?: string;
  error: Error & { digest?: string };
  reset?: () => void;
  retry?: () => void;
};

export default function TerminalErrorView({
  segment = 'SEGMENT',
  error,
  reset,
  retry,
}: TerminalErrorProps) {
  useEffect(() => {
    // Record error telemetry
    console.error(`[Terminal Watchdog] Runtime fault in ${segment}:`, error);
  }, [error, segment]);

  const handleRetry = () => {
    if (typeof retry === 'function') {
      retry();
    } else if (typeof reset === 'function') {
      reset();
    }
  };

  return (
    <div className="w-full min-h-full flex items-center justify-center p-4 md:p-8 bg-black select-none">
      <div className="w-full max-w-xl border border-red-900/80 bg-zinc-950 p-6 md:p-8 shadow-2xl shadow-red-950/20">
        {/* Terminal Alert Banner */}
        <div className="flex items-center justify-between border-b border-red-900/50 pb-3 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-sm bg-red-500 animate-ping" />
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-red-500">
              RUNTIME_FAULT // {segment}_INTERRUPT
            </span>
          </div>
          <span className="font-mono text-[9px] text-zinc-600 uppercase">FAULT 0x500</span>
        </div>

        {/* Diagnostic Details */}
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <AlertTriangle size={24} className="text-red-500 shrink-0 mt-0.5" />
            <div>
              <h2 className="text-base md:text-lg font-bold text-white font-mono uppercase tracking-wide">
                Terminal Execution Fault
              </h2>
              <p className="mt-1 text-xs text-zinc-400 font-mono leading-relaxed">
                An unexpected exception halted telemetry streaming in [{segment}].
              </p>
            </div>
          </div>

          {/* Traceback Monospace Box */}
          <div className="border border-zinc-800 bg-black p-3.5 font-mono text-[11px] text-zinc-300 overflow-x-auto custom-scrollbar">
            <div className="text-red-400 font-semibold mb-1">
              EXCEPTION: {error?.name || 'Error'}
            </div>
            <div className="text-zinc-400 break-words">
              {error?.message || 'An unknown execution error occurred in component hierarchy.'}
            </div>
            {error?.digest && (
              <div className="mt-2 text-[9px] text-zinc-600 border-t border-zinc-900 pt-1.5">
                DIGEST: <span className="text-zinc-500">{error.digest}</span>
              </div>
            )}
          </div>

          {/* Operator Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-4">
            <button
              type="button"
              onClick={handleRetry}
              className="inline-flex items-center gap-2 border border-amber-500 bg-amber-500 px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-black transition-colors hover:bg-amber-400 cursor-pointer"
            >
              <RefreshCcw size={13} />
              RETRY EXECUTION
            </button>

            <Link
              href="/"
              className="inline-flex items-center gap-2 border border-zinc-800 bg-black px-4 py-2 font-mono text-xs uppercase tracking-wider text-zinc-400 transition-colors hover:border-zinc-600 hover:text-white"
            >
              <ArrowLeft size={13} />
              RETURN TO MONITOR
            </Link>
          </div>
        </div>

        {/* Footer Diagnostics */}
        <div className="mt-8 border-t border-zinc-900 pt-3 flex items-center justify-between text-[9px] font-mono text-zinc-600">
          <span className="flex items-center gap-1.5">
            <Terminal size={10} /> SEEFIN WATCHDOG
          </span>
          <span>STATE: RECOVERABLE</span>
        </div>
      </div>
    </div>
  );
}
