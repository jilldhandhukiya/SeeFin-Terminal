import React from 'react';
import { LayoutGrid, Wallet, Briefcase, Globe, ShieldCheck } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'DASH', label: 'Monitor', icon: LayoutGrid, short: 'F1' },
    { id: 'EXP', label: 'Ledger', icon: Wallet, short: 'F2' },
    { id: 'ASST', label: 'Assets', icon: Briefcase, short: 'F3' },
    { id: 'NEWS', label: 'Wire', icon: Globe, short: 'F4' },
  ];

  return (
    <aside className="w-16 md:w-48 bg-black border-r border-gray-800 flex flex-col justify-between shrink-0">
      <div className="flex flex-col">
        <div className="p-3 text-[9px] font-mono text-gray-600 uppercase hidden md:block">Function Key</div>
        {navItems.map((item) => (
          <button 
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`
              h-12 md:h-10 px-0 md:px-4 flex items-center justify-center md:justify-between border-b border-gray-900 hover:bg-gray-900 transition-colors group relative
              ${activeTab === item.id ? 'bg-gray-900 text-amber-500 border-l-2 border-l-amber-500' : 'text-gray-400 border-l-2 border-l-transparent'}
            `}
          >
            <div className="flex items-center gap-3">
              <item.icon size={16} strokeWidth={1.5} />
              <span className="hidden md:block text-xs font-mono font-bold uppercase tracking-wider">{item.label}</span>
            </div>
            <span className="hidden md:block text-[9px] text-gray-600 font-mono group-hover:text-amber-600">{item.short}</span>
          </button>
        ))}
      </div>

      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-2 text-gray-500 mb-2">
          <ShieldCheck size={14} />
          <span className="hidden md:block text-[10px] font-mono uppercase">System Good</span>
        </div>
        <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full bg-green-600 w-full animate-pulse"></div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;