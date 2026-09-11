'use client';

import Link from 'next/link';
import { Terminal, LogOut } from 'lucide-react';
import { useAppState } from '@/state/appStateData';

const Header = () => {
  const { time } = useAppState();

  return (
    <header className="h-12 bg-black border-b border-gray-800 flex items-center justify-between px-2 shrink-0 select-none">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <Link href="/" className="flex items-center gap-2 text-amber-500 font-bold font-mono text-sm tracking-tighter shrink-0 hover:opacity-90 transition-opacity">
          <Terminal size={14} />
          <span>See<span className="text-white">Trade</span></span>
        </Link>
      </div>
      
      <div className="flex items-center gap-4 text-[10px] font-mono text-gray-500 shrink-0">
        <span suppressHydrationWarning className="text-white tabular-nums">{time ?? '--:--:--'}</span>
        <Link
          href="/auth"
          className="flex items-center gap-2 px-3 py-1.5 bg-amber-500 text-black font-bold rounded hover:bg-amber-600 transition-colors"
        >
          <LogOut size={14} />
          <span>Auth</span>
        </Link>
      </div>
    </header>
  );
};

export default Header;
