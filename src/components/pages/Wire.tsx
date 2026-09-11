'use client';

import { useState } from 'react';
import TerminalWorkspace from '@/components/layout/TerminalWorkspace';
import TerminalGrid from '@/components/layout/TerminalGrid';
import TerminalPanel from '@/components/ui/TerminalPanel';
import TradingViewEconomicCalendar from '@/components/widgets/TradingviewWidgets/TradingViewEconomicCalendar';
import TradingViewTimeline from '@/components/widgets/TradingviewWidgets/TradingViewTimeline';
import { Calendar, Filter, Globe, Lock, Search, ShieldCheck } from 'lucide-react';

const PRIVATE_WIRE = [
  { id: 1, title: 'OFFSHORE ACCOUNTS AUDIT', time: '09:45', priority: 'HIGH', category: 'COMPLIANCE', content: 'Annual audit for Cayman trust scheduled for Dec 15. Prepare compliance and custody reports.' },
  { id: 2, title: 'VENTURE CAP CALL', time: '08:30', priority: 'MED', category: 'MEETING', content: 'Series B follow-on allocation discussion with institutional syndicate partners.' },
  { id: 3, title: 'REAL ESTATE ACQUISITION', time: 'YESTERDAY', priority: 'LOW', category: 'ASSET', content: 'Closing settlement documents for Manhattan commercial penthouse finalized.' },
  { id: 4, title: 'TAX OPTIMIZATION STRATEGY', time: 'YESTERDAY', priority: 'HIGH', category: 'FINANCE', content: 'Review harvest loss offsets and sovereign bond yield treatment prior to fiscal year end.' },
  { id: 5, title: 'LIQUIDITY SWAP INITIATED', time: '2 DAYS AGO', priority: 'MED', category: 'FINANCE', content: 'Multi-currency treasury swap execution completed with clearing bank.' },
  { id: 6, title: 'REGULATORY COMPLIANCE UPDATE', time: '3 DAYS AGO', priority: 'HIGH', category: 'COMPLIANCE', content: 'SEBI and RBI reporting disclosures filed for offshore investment vehicle.' },
];

const CATEGORIES = ['ALL', 'COMPLIANCE', 'FINANCE', 'MEETING', 'ASSET'] as const;

const Wire = () => {
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredWire = PRIVATE_WIRE.filter((item) => {
    const matchesCategory = activeCategory === 'ALL' || item.category === activeCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <TerminalWorkspace>
      <div className="flex flex-col gap-1.5 md:gap-2 w-full">
        {/* Row 1: Dual Balanced Wire Panels (Private + Global) */}
        <TerminalGrid variant="2-col" minColWidth={460} className="min-h-[520px]">
          {/* Pad 1: Private Encrypted Wire */}
          <TerminalPanel
            title="PRIVATE_WIRE // ENCRYPTED"
            actions={<Lock size={11} className="text-amber-500" />}
            toolbar={
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-1">
                  <Filter size={10} className="text-zinc-500 mr-1 shrink-0" />
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-2 py-0.5 text-[8px] font-mono uppercase tracking-wider border transition-colors cursor-pointer ${
                        activeCategory === cat
                          ? 'bg-amber-600 text-black border-amber-600 font-bold'
                          : 'text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-1.5 border border-zinc-800 bg-black px-2 py-0.5 max-w-[160px]">
                  <Search size={10} className="text-zinc-500 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="FILTER WIRE..."
                    className="w-full bg-transparent text-[9px] font-mono text-zinc-200 outline-none uppercase placeholder:text-zinc-600"
                  />
                </div>
              </div>
            }
            footer={
              <>
                <span className="flex items-center gap-1 text-emerald-400">
                  <ShieldCheck size={10} /> END-TO-END ENCRYPTED
                </span>
                <span>{filteredWire.length} OF {PRIVATE_WIRE.length} DISPATCHES</span>
              </>
            }
          >
            <div className="divide-y divide-zinc-800/80">
              {filteredWire.map((item) => (
                <div
                  key={item.id}
                  className="group cursor-pointer border-l-2 border-l-transparent p-3.5 transition-colors hover:border-l-amber-500 hover:bg-zinc-900/40"
                >
                  <div className="mb-1 flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-xs border px-1.5 py-0.5 text-[8px] font-mono font-bold ${
                          item.priority === 'HIGH'
                            ? 'border-red-900/80 bg-red-950/30 text-red-400'
                            : item.priority === 'MED'
                            ? 'border-amber-900/80 bg-amber-950/30 text-amber-400'
                            : 'border-sky-900/80 bg-sky-950/30 text-sky-400'
                        }`}
                      >
                        {item.priority}
                      </span>
                      <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-wider">
                        {item.category}
                      </span>
                    </div>
                    <span className="text-[9px] font-mono text-zinc-500">{item.time}</span>
                  </div>
                  <h3 className="mb-1 text-xs font-bold font-mono text-zinc-200 group-hover:text-amber-400">
                    {item.title}
                  </h3>
                  <p className="text-[10px] leading-relaxed font-mono text-zinc-400">
                    {item.content}
                  </p>
                </div>
              ))}
            </div>
          </TerminalPanel>

          {/* Pad 2: Global Wire News Feed */}
          <TerminalPanel
            title="GLOBAL_WIRE // PUBLIC_FEED"
            actions={<Globe size={11} className="text-sky-400" />}
            footer={<span>SOURCE: TRADINGVIEW RSS REALTIME SYNDICATE</span>}
          >
            <div className="h-full w-full flex-1 flex flex-col bg-black p-0 min-h-[440px]">
              <TradingViewTimeline />
            </div>
          </TerminalPanel>
        </TerminalGrid>

        {/* Row 2: Full-Width Institutional Economic Calendar */}
        <div className="w-full">
          <TerminalPanel
            title="ECONOMIC_CALENDAR // TRADINGVIEW"
            actions={<Calendar size={11} className="text-emerald-400" />}
            footer={<span>GLOBAL MACRO DATA RELEASE SCHEDULE & FORECASTS</span>}
          >
            <div className="w-full bg-black p-0">
              <TradingViewEconomicCalendar />
            </div>
          </TerminalPanel>
        </div>
      </div>
    </TerminalWorkspace>
  );
};

export default Wire;
