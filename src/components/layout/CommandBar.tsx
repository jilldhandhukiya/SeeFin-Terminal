'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Search, Command } from 'lucide-react';
import UniversalSearch from '@/components/search/UniversalSearch';

const CommandBar = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const pathname = usePathname();

  const getModuleName = () => {
    if (pathname === '/auth') return 'AUTH_GATE';
    if (pathname === '/market-overview') return 'MARKET_OVERVIEW';
    if (pathname === '/ledger') return 'TRANSACTION_LEDGER';
    if (pathname === '/assets') return 'PORTFOLIO_MGMT';
    if (pathname === '/screener') return 'EQUITY_SCREENER';
    if (pathname === '/wire') return 'NEWS_FEED';
    if (pathname === '/settings') return 'TERMINAL_CONFIG';
    if (pathname === '/testing/trade/fno') return 'FNO_DERIVATIVES';
    if (pathname === '/testing/trade') return 'PAPER_TRADE';
    if (pathname === '/testing' || pathname.startsWith('/testing/')) return 'TESTING_LAB';
    return 'DASHBOARD';
  };

  // Global shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.altKey && e.code === 'Space') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <div className="h-10 bg-black border-b border-gray-800 flex items-center px-4 gap-2 shrink-0 select-none">
        <span className="text-amber-500 font-mono font-bold text-sm">Market</span>
        <span className="text-gray-600 text-sm">/</span>
        <span className="text-gray-300 font-mono text-sm uppercase">{getModuleName()}</span>
        <div className="flex-1" />
        <button 
          onClick={() => setIsSearchOpen(true)}
          className="flex items-center bg-gray-900 border border-gray-700 px-2 py-1 gap-2 w-48 hover:border-amber-500 hover:bg-gray-800 transition-colors group cursor-pointer"
        >
          <Search size={12} className="text-amber-600 group-hover:text-amber-500" />
          <span className="text-[10px] text-gray-400 group-hover:text-gray-200 font-mono uppercase">SEARCH</span>
          <div className="ml-auto flex items-center gap-0.5">
            <Command size={8} className="text-gray-600" />
            <span className="text-[8px] text-gray-600 font-mono">+</span>
            <span className="text-[8px] text-gray-600 font-mono">ALT</span>
            <span className="text-[8px] text-gray-600 font-mono">+</span>
            <span className="text-[8px] text-gray-600 font-mono">SPACE</span>
          </div>
        </button>
      </div>

      {/* Universal Search Modal */}
      {isSearchOpen && <UniversalSearch onClose={() => setIsSearchOpen(false)} />}
    </>
  );
};

export default CommandBar;
