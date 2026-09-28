'use client';

import { useState } from 'react';
import TerminalWorkspace from '@/components/layout/TerminalWorkspace';
import TerminalPanel from '@/components/ui/TerminalPanel';
import { Filter, ChevronDown, ArrowUpRight, ArrowDownRight, BarChart2 } from 'lucide-react';

const SCREENER_DATA = [
  { symbol: 'NVDA', name: 'NVIDIA CORP', price: 145.60, chg: 3.2, vol: '45.2M', cap: '3.5T', pe: 65.2, sector: 'TECH' },
  { symbol: 'TSLA', name: 'TESLA INC', price: 342.10, chg: -1.4, vol: '22.8M', cap: '1.1T', pe: 82.1, sector: 'AUTO' },
  { symbol: 'AAPL', name: 'APPLE INC', price: 228.45, chg: 0.8, vol: '31.5M', cap: '3.4T', pe: 31.4, sector: 'TECH' },
  { symbol: 'MSFT', name: 'MICROSOFT', price: 415.20, chg: 1.1, vol: '18.2M', cap: '3.1T', pe: 34.5, sector: 'TECH' },
  { symbol: 'AMZN', name: 'AMAZON.COM', price: 198.30, chg: 2.4, vol: '28.4M', cap: '2.0T', pe: 42.8, sector: 'RETAIL' },
  { symbol: 'META', name: 'META PLATFORMS', price: 582.15, chg: -0.5, vol: '14.6M', cap: '1.4T', pe: 28.2, sector: 'COMM' },
  { symbol: 'AVGO', name: 'BROADCOM INC', price: 172.40, chg: 4.1, vol: '8.2M', cap: '820B', pe: 48.1, sector: 'TECH' },
  { symbol: 'JPM', name: 'JP MORGAN', price: 245.80, chg: 0.2, vol: '10.5M', cap: '680B', pe: 12.4, sector: 'FIN' },
];

const Screener = () => {
  const [activeFilter, setActiveFilter] = useState('MOST_ACTIVE');

  return (
    <TerminalWorkspace>
      <div className="flex flex-col min-h-full w-full flex-1">
        <TerminalPanel
          title="EQUITY_SCREENER // REAL-TIME"
          className="min-h-full flex-1"
          toolbar={
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-amber-500 uppercase border-r border-zinc-800 pr-3 shrink-0">
                <Filter size={11} />
                Universe: NASDAQ 100
              </div>
              <div className="flex flex-wrap gap-1">
                {['MOST_ACTIVE', 'TOP_GAINERS', 'TOP_LOSERS', 'HIGH_VOLATILITY'].map((f) => (
                  <button 
                    key={f}
                    onClick={() => setActiveFilter(f)}
                    className={`px-2.5 py-1 text-[9px] font-mono border uppercase tracking-wider transition-colors cursor-pointer ${
                      activeFilter === f
                        ? 'bg-amber-600 text-black border-amber-600 font-bold'
                        : 'text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-white'
                    }`}
                  >
                    {f.replace('_', ' ')}
                  </button>
                ))}
              </div>
              <div className="ml-auto flex items-center gap-2 shrink-0">
                <button className="flex items-center gap-1 text-[9px] font-mono text-zinc-400 hover:text-white border border-zinc-800 px-2 py-1 cursor-pointer">
                  GICS SECTOR <ChevronDown size={10} />
                </button>
              </div>
            </div>
          }
          footer={
            <>
              <div className="flex gap-4">
                <span className="text-[9px] font-mono text-zinc-500 uppercase">ADV: <span className="text-emerald-400 font-bold">82</span></span>
                <span className="text-[9px] font-mono text-zinc-500 uppercase">DEC: <span className="text-rose-400 font-bold">18</span></span>
                <span className="text-[9px] font-mono text-zinc-500 uppercase">UNCH: <span className="text-zinc-400 font-bold">0</span></span>
              </div>
              <span className="text-[9px] font-mono text-zinc-500">SOURCE: REAL-TIME TERMINAL AGGREGATOR</span>
            </>
          }
        >
          <div className="h-full overflow-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[760px]">
              <thead className="sticky top-0 bg-black z-10 shadow-xs ring-1 ring-zinc-850">
                <tr className="text-[9px] text-zinc-500 font-mono uppercase tracking-wider border-b border-zinc-800">
                  <th className="p-3 font-normal">Ticker</th>
                  <th className="p-3 font-normal">Last Price</th>
                  <th className="p-3 font-normal">Chg %</th>
                  <th className="p-3 font-normal">Volume</th>
                  <th className="p-3 font-normal">Mkt Cap</th>
                  <th className="p-3 font-normal">P/E Ratio</th>
                  <th className="p-3 font-normal">Sector</th>
                  <th className="p-3 font-normal text-right">Action</th>
                </tr>
              </thead>
              <tbody className="text-xs font-mono divide-y divide-zinc-850">
                {SCREENER_DATA.map((row) => (
                  <tr key={row.symbol} className="hover:bg-zinc-900/40 group cursor-default transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-amber-500">{row.symbol}</span>
                        <span className="text-[9px] text-zinc-500 truncate max-w-[120px]">{row.name}</span>
                      </div>
                    </td>
                    <td className="p-3 text-zinc-200 font-semibold">{row.price.toFixed(2)}</td>
                    <td className={`p-3 font-bold ${row.chg >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      <div className="flex items-center gap-1">
                        {row.chg >= 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                        {row.chg > 0 ? '+' : ''}{row.chg}%
                      </div>
                    </td>
                    <td className="p-3 text-zinc-400">{row.vol}</td>
                    <td className="p-3 text-zinc-400">{row.cap}</td>
                    <td className="p-3 text-zinc-400">{row.pe}</td>
                    <td className="p-3">
                      <span className="px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 text-[8px] text-zinc-400 rounded-xs uppercase">{row.sector}</span>
                    </td>
                    <td className="p-3 text-right">
                      <button className="opacity-0 group-hover:opacity-100 transition-opacity text-amber-500 hover:text-amber-400 cursor-pointer">
                        <BarChart2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TerminalPanel>
      </div>
    </TerminalWorkspace>
  );
};

export default Screener;
