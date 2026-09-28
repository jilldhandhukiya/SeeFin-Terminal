'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, Wallet, Briefcase, Globe, Settings, BarChart3, FlaskConical } from 'lucide-react';

const Sidebar = () => {
  const pathname = usePathname();

  const navItems = [
    { to: '/', label: 'Monitor', icon: LayoutGrid, short: 'F1', exact: true },
    { to: '/ledger', label: 'Ledger', icon: Wallet, short: 'F2' },
    { to: '/assets', label: 'Assets', icon: Briefcase, short: 'F3' },
    { to: '/screener', label: 'Screener', icon: BarChart3, short: 'F4' },
    { to: '/wire', label: 'Wire', icon: Globe, short: 'F5' },
    { to: '/testing', label: 'Testing', icon: FlaskConical, short: 'F6' },
  ];

  const isSettingsActive = pathname === '/settings' || pathname.startsWith('/settings/');

  return (
    <aside className="w-16 md:w-48 bg-black border-r border-gray-800 flex flex-col justify-between shrink-0 select-none">
      <div className="flex flex-col">
        <div className="p-3 text-[9px] font-mono text-gray-600 uppercase hidden md:block">Function Key</div>
        {navItems.map((item) => {
          const isActive = item.exact ? pathname === item.to : (pathname === item.to || pathname.startsWith(item.to + '/'));

          return (
            <Link
              key={item.to}
              href={item.to}
              className={`h-12 md:h-10 px-0 md:px-4 flex items-center justify-center md:justify-between border-b border-gray-900 hover:bg-gray-900 transition-colors group relative border-l-2 ${
                isActive ? 'bg-gray-900 text-amber-500 border-l-amber-500' : 'text-gray-400 border-l-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon size={16} strokeWidth={1.5} />
                <span className="hidden md:block text-xs font-mono font-bold uppercase tracking-wider">{item.label}</span>
              </div>
              <span className="hidden md:block text-[9px] text-gray-600 font-mono group-hover:text-amber-600">{item.short}</span>
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-gray-800">
        <Link
          href="/settings"
          className={`w-full flex items-center justify-center md:justify-start gap-2 px-3 py-2 rounded border transition-colors group ${
            isSettingsActive ? 'bg-amber-950/20 text-amber-500 border-amber-500' : 'border-gray-700 hover:border-amber-500 hover:bg-amber-950/30 text-gray-400 hover:text-amber-500'
          }`}
        >
          <Settings size={14} />
          <span className="hidden md:block text-[10px] font-mono uppercase font-bold">Settings</span>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
