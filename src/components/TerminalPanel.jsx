import React from 'react';
import { MoreHorizontal } from 'lucide-react';

const TerminalPanel = ({ children, title, className = '', actions }) => (
  <div className={`bg-black border border-gray-800 flex flex-col ${className}`}>
    <div className="bg-gray-900/50 border-b border-gray-800 px-3 py-1 flex items-center justify-between h-8 shrink-0">
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 bg-amber-500 rounded-sm"></div>
        <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest font-mono">{title}</span>
      </div>
      <div className="flex items-center gap-2">
        {actions}
        <MoreHorizontal size={12} className="text-gray-600 cursor-pointer hover:text-amber-500" />
      </div>
    </div>
    <div className="p-0 flex-1 overflow-auto bg-black relative">
      {/* Subtle Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:20px_20px] opacity-[0.1] pointer-events-none"></div>
      <div className="relative z-10 h-full">{children}</div>
    </div>
  </div>
);

export default TerminalPanel;