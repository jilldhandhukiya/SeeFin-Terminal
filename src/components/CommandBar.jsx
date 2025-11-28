import React from 'react';
import { Search } from 'lucide-react';

const CommandBar = ({ activeTab }) => {
  const getModuleName = () => {
    switch(activeTab) {
      case 'DASH': return 'DASHBOARD';
      case 'EXP': return 'TRANSACTION_LEDGER';
      case 'ASST': return 'PORTFOLIO_MGMT';
      case 'NEWS': return 'NEWS_FEED';
      default: return 'DASHBOARD';
    }
  };

  return (
    <div className="h-10 bg-black border-b border-gray-800 flex items-center px-4 gap-2 shrink-0">
      <span className="text-amber-500 font-mono font-bold text-sm">Market</span>
      <span className="text-gray-600 text-sm">/</span>
      <span className="text-gray-300 font-mono text-sm uppercase">{getModuleName()}</span>
      <div className="flex-1"></div>
      <div className="flex items-center bg-gray-900 border border-gray-700 px-2 py-1 gap-2 w-48 focus-within:border-amber-500">
        <Search size={12} className="text-amber-600" />
        <input className="bg-transparent border-none outline-none text-[10px] text-white w-full uppercase placeholder:text-gray-700" placeholder="COMMAND SEARCH..." />
      </div>
    </div>
  );
};

export default CommandBar;