'use client';

import { useState } from 'react';
import Link from 'next/link';
import TerminalPanel from '@/components/ui/TerminalPanel';
import TerminalWorkspace from '@/components/layout/TerminalWorkspace';
import TerminalGrid from '@/components/layout/TerminalGrid';
import TradingViewNewsWidget from '@/components/widgets/TradingviewWidgets/TradingViewNewsWidget';
import { ChevronRight } from 'lucide-react';

const MARKET_DATA = {
  IN: [
    { symbol: 'NIFTY50', name: 'NIFTY 50', price: 24140.3, change: 0.23, trend: [23800, 23900, 23850, 24000, 24050, 24100, 24140] },
    { symbol: 'SENSEX', name: 'BSE SENSEX', price: 79800.15, change: 0.18, trend: [79200, 79400, 79300, 79600, 79700, 79750, 79800] },
    { symbol: 'BANKNIFTY', name: 'BANK NIFTY', price: 51200.45, change: -0.45, trend: [51500, 51400, 51450, 51300, 51250, 51100, 51200] },
    { symbol: 'RELIANCE', name: 'RELIANCE IND', price: 2890.5, change: 1.2, trend: [2800, 2820, 2810, 2850, 2870, 2880, 2890] },
  ],
  CRYPTO: [
    { symbol: 'BTC/INR', name: 'BITCOIN', price: 95432.1, change: 2.45, trend: [92000, 93500, 93000, 94200, 94800, 95100, 95432] },
    { symbol: 'ETH/INR', name: 'ETHEREUM', price: 3450.2, change: 1.12, trend: [3300, 3350, 3340, 3400, 3420, 3440, 3450] },
    { symbol: 'SOL/INR', name: 'SOLANA', price: 145.6, change: 5.67, trend: [135, 138, 140, 139, 142, 144, 145] },
    { symbol: 'DOGE', name: 'DOGECOIN', price: 0.38, change: -1.2, trend: [0.4, 0.39, 0.395, 0.385, 0.382, 0.378, 0.38] },
  ],
} as const;

type SparklineProps = {
  data: readonly number[];
  color: string;
};

type MarketRegion = keyof typeof MARKET_DATA;

const Sparkline = ({ data, color }: SparklineProps) => {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 100;
  const height = 30;

  const points = data
    .map((val, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * height;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
};

const MarketWidget = () => {
  const regions: MarketRegion[] = ['IN', 'CRYPTO'];
  const [region, setRegion] = useState<MarketRegion>('IN');

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center border-b border-gray-800 bg-gray-950/50">
        {regions.map((currentRegion) => (
          <button
            key={currentRegion}
            onClick={() => setRegion(currentRegion)}
            className={`flex-1 py-1.5 text-[10px] font-mono font-bold uppercase tracking-widest transition-colors cursor-pointer ${region === currentRegion ? 'bg-amber-600 text-black' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-900'}`}
          >
            {currentRegion === 'IN' ? 'INDIA' : currentRegion}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-black z-10 shadow-sm">
            <tr className="text-[9px] text-gray-600 font-mono uppercase tracking-wider border-b border-gray-800">
              <th className="p-2 font-normal pl-3">Instrument</th>
              <th className="p-2 font-normal text-right">Last</th>
              <th className="p-2 font-normal text-right">Chg%</th>
              <th className="p-2 font-normal w-24 pr-3 text-right">Trend (1H)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {MARKET_DATA[region].map((item) => (
              <tr key={item.symbol} className="group hover:bg-gray-900/40 transition-colors cursor-pointer">
                <td className="p-2 pl-3">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-amber-500 font-mono group-hover:text-amber-400">{item.symbol}</span>
                    <span className="text-[9px] text-gray-500 uppercase">{item.name}</span>
                  </div>
                </td>
                <td className="p-2 text-right font-mono text-xs text-gray-200">
                  {item.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className={`p-2 text-right font-mono text-xs ${item.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {item.change > 0 ? '+' : ''}
                  {item.change}%
                </td>
                <td className="p-2 pr-3 h-10 w-24">
                  <div className="h-6 w-full opacity-60 group-hover:opacity-100 transition-opacity">
                    <Sparkline data={item.trend} color={item.change >= 0 ? '#22c55e' : '#ef4444'} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const Dashboard = () => {
  return (
    <TerminalWorkspace>
      <TerminalGrid variant="2-col" minColWidth={460} className="min-h-[620px]">
        <TerminalPanel
          title="MARKET_OVERVIEW"
          actions={
            <Link
              href="/market-overview"
              className="flex items-center gap-1 text-[9px] font-bold text-amber-500 border border-amber-900/50 bg-amber-950/20 px-2 py-0.5 hover:bg-amber-600 hover:text-black transition-all"
            >
              MORE <ChevronRight size={8} />
            </Link>
          }
        >
          <MarketWidget />
        </TerminalPanel>

        <TerminalPanel title="LATEST_STORIES">
          <div className="h-full w-full flex-1 flex flex-col bg-black p-0 min-h-[480px]">
            <TradingViewNewsWidget />
          </div>
        </TerminalPanel>
      </TerminalGrid>
    </TerminalWorkspace>
  );
};

export default Dashboard;
