import React from 'react';
import { Terminal } from 'lucide-react';
import TradingViewTicker from '@/components/TradingviewWidgets/TradingViewTicker';

const Header = ({ time }) => {
  return (
    <header className="h-8 bg-black border-b border-gray-800 flex items-center justify-between px-2 shrink-0">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="flex items-center gap-2 text-amber-500 font-bold font-mono text-sm tracking-tighter shrink-0">
          <Terminal size={14} />
          <span>See<span className="text-white">Fin</span></span>
        </div>
        {/* TradingView Ticker Widget */}
        <div className="hidden md:flex border-l border-gray-800 pl-4 flex-1 overflow-hidden h-8">
          <TradingViewTicker />
        </div>
      </div>
      
      <div className="flex items-center gap-4 text-[10px] font-mono text-gray-500 shrink-0">
        <span className="text-gray-300">{time} IST</span>
      </div>
    </header>
  );
};

export default Header;