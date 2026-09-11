'use client';

import React, { useState } from 'react';
import { Maximize2, Minimize2, MoreHorizontal } from 'lucide-react';

export type TerminalPanelProps = {
  children: React.ReactNode;
  title: string;
  className?: string;
  bodyClassName?: string;
  actions?: React.ReactNode;
  /** Sub-header toolbar slot (e.g. search bar, filter tabs) */
  toolbar?: React.ReactNode;
  /** Footer bar for telemetry, record counts, or pagination */
  footer?: React.ReactNode;
  /** Enable window maximize/fullscreen toggle (default: true) */
  canMaximize?: boolean;
};

export default function TerminalPanel({
  children,
  title,
  className = '',
  bodyClassName = '',
  actions,
  toolbar,
  footer,
  canMaximize = true,
}: TerminalPanelProps) {
  const [isMaximized, setIsMaximized] = useState(false);

  return (
    <section
      className={`bg-black border border-zinc-800/80 flex flex-col transition-all duration-150 ${
        isMaximized
          ? 'fixed inset-2 z-50 shadow-2xl border-amber-500/80'
          : `${className.includes('h-') ? '' : 'h-full'} ${className}`.trim()
      }`}
    >
      {/* Header Bar */}
      <header className="bg-zinc-950/90 border-b border-zinc-800/80 px-3 py-1.5 flex items-center justify-between min-h-[32px] shrink-0 select-none">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-1.5 h-1.5 rounded-sm bg-amber-500 shrink-0" />
          <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest font-mono truncate">
            {title}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {actions}
          {canMaximize && (
            <button
              type="button"
              onClick={() => setIsMaximized((prev) => !prev)}
              title={isMaximized ? 'Restore window' : 'Maximize window'}
              className="p-1 text-zinc-500 hover:text-amber-400 transition-colors cursor-pointer"
            >
              {isMaximized ? <Minimize2 size={11} /> : <Maximize2 size={11} />}
            </button>
          )}
          <MoreHorizontal size={12} className="text-zinc-600 hover:text-zinc-300 cursor-pointer" />
        </div>
      </header>

      {/* Sub-Header Toolbar (if provided) */}
      {toolbar && (
        <div className="border-b border-zinc-800/80 bg-zinc-950/50 px-3 py-1.5 shrink-0">
          {toolbar}
        </div>
      )}

      {/* Main Body */}
      <div
        className={`p-0 flex-1 bg-black relative min-h-0 flex flex-col ${
          bodyClassName || 'overflow-auto custom-scrollbar'
        }`}
      >
        {/* Subtle Bloomberg Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#18181b_1px,transparent_1px),linear-gradient(to_bottom,#18181b_1px,transparent_1px)] bg-[size:24px_24px] opacity-[0.08] pointer-events-none" />
        <div className="relative z-10 flex-1 min-h-full h-full w-full flex flex-col">{children}</div>
      </div>

      {/* Footer Bar (if provided) */}
      {footer && (
        <footer className="border-t border-zinc-800/80 bg-zinc-950/70 px-3 py-1 text-[9px] font-mono text-zinc-500 flex items-center justify-between shrink-0 select-none">
          {footer}
        </footer>
      )}
    </section>
  );
}

/** Alias export for semantic terminology */
export const TerminalPad = TerminalPanel;
