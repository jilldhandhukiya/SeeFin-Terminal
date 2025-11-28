'use client';
import React, { useState, useMemo } from 'react';
import TerminalPanel from '@/components/TerminalPanel';
import Metric from '@/components/Metric';
import TradingViewNewsWidget from '@/components/TradingviewWidgets/TradingViewNewsWidget';
import { formatCompact } from '@/utils/formatting';
import { ChevronRight } from 'lucide-react';


const MARKET_DATA = {
  IN: [
    { symbol: 'NIFTY50', name: 'NIFTY 50', price: 24140.30, change: 0.23, trend: [23800, 23900, 23850, 24000, 24050, 24100, 24140] },
    { symbol: 'SENSEX', name: 'BSE SENSEX', price: 79800.15, change: 0.18, trend: [79200, 79400, 79300, 79600, 79700, 79750, 79800] },
    { symbol: 'BANKNIFTY', name: 'BANK NIFTY', price: 51200.45, change: -0.45, trend: [51500, 51400, 51450, 51300, 51250, 51100, 51200] },
    { symbol: 'RELIANCE', name: 'RELIANCE IND', price: 2890.50, change: 1.20, trend: [2800, 2820, 2810, 2850, 2870, 2880, 2890] },
  ],
  US: [
    { symbol: 'SPX', name: 'S&P 500', price: 5892.40, change: 0.54, trend: [5800, 5820, 5815, 5850, 5870, 5885, 5892] },
    { symbol: 'NDX', name: 'NASDAQ 100', price: 20430.12, change: 0.89, trend: [20100, 20200, 20150, 20300, 20350, 20400, 20430] },
    { symbol: 'DJI', name: 'DOW JONES', price: 42800.50, change: -0.12, trend: [42900, 42950, 42850, 42900, 42850, 42820, 42800] },
    { symbol: 'VIX', name: 'VOLATILITY', price: 15.20, change: -2.40, trend: [18, 17, 17.5, 16, 15.8, 15.5, 15.2] },
  ],
  CRYPTO: [
    { symbol: 'BTC/USD', name: 'BITCOIN', price: 95432.10, change: 2.45, trend: [92000, 93500, 93000, 94200, 94800, 95100, 95432] },
    { symbol: 'ETH/USD', name: 'ETHEREUM', price: 3450.20, change: 1.12, trend: [3300, 3350, 3340, 3400, 3420, 3440, 3450] },
    { symbol: 'SOL/USD', name: 'SOLANA', price: 145.60, change: 5.67, trend: [135, 138, 140, 139, 142, 144, 145] },
    { symbol: 'DOGE', name: 'DOGECOIN', price: 0.38, change: -1.20, trend: [0.40, 0.39, 0.395, 0.385, 0.382, 0.378, 0.38] },
  ]
};

// 1. Sparkline (Mini Chart)
const Sparkline = ({ data, color }) => {
    if (!data || data.length < 2) return null;
    
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const width = 100;
    const height = 30;
    
    const points = data.map((val, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((val - min) / range) * height;
        return `${x},${y}`;
    }).join(' ');

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

// 5. Market Widget (The requested component)
const MarketWidget = () => {
  const [region, setRegion] = useState('IN'); // IN, US, CRYPTO

  return (
    <div className="flex flex-col h-full">
      {/* Tab Bar */}
      <div className="flex items-center border-b border-gray-800 bg-gray-950/50">
        {['IN', 'US', 'CRYPTO'].map(r => (
           <button
             key={r}
             onClick={() => setRegion(r)}
             className={`
               flex-1 py-1.5 text-[10px] font-mono font-bold uppercase tracking-widest transition-colors
               ${region === r 
                 ? 'bg-amber-600 text-black' 
                 : 'text-gray-500 hover:text-gray-300 hover:bg-gray-900'}
             `}
           >
             {r === 'IN' ? 'INDIA' : r}
           </button>
        ))}
      </div>

      {/* Market List */}
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
                            {item.price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                        </td>
                        <td className={`p-2 text-right font-mono text-xs ${item.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {item.change > 0 ? '+' : ''}{item.change}%
                        </td>
                        <td className="p-2 pr-3 h-10 w-24">
                            <div className="h-6 w-full opacity-60 group-hover:opacity-100 transition-opacity">
                                <Sparkline 
                                    data={item.trend} 
                                    color={item.change >= 0 ? '#22c55e' : '#ef4444'} 
                                />
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

const PortfolioWidget = ({ assets }) => {
    const [selectedType, setSelectedType] = useState(null);

    // Group assets logic
    const { allocation, total, groupedData } = useMemo(() => {
        const total = assets.reduce((acc, curr) => acc + curr.value, 0);
        const grouped = assets.reduce((acc, asset) => {
            if(!acc[asset.type]) acc[asset.type] = { value: 0, count: 0, assets: [] };
            acc[asset.type].value += asset.value;
            acc[asset.type].count += 1;
            acc[asset.type].assets.push(asset);
            return acc;
        }, {});
        
        // Pure value map for chart
        const alloc = Object.entries(grouped).reduce((acc, [key, val]) => {
            acc[key] = val.value;
            return acc;
        }, {});

        return { allocation: alloc, total, groupedData: grouped };
    }, [assets]);

    const colors = {
        'EQTY': '#f59e0b', // Amber
        'CMDTY': '#eab308', // Yellow
        'FX': '#22c55e',    // Green
        'CRYPTO': '#3b82f6', // Blue
        'CASH': '#64748b'    // Slate
    };

    let cumulativePercent = 0;

    return (
        <div className="flex flex-col lg:flex-row h-full w-full">
            
            {/* 1. CHART SECTION (Adaptive Size: Vertical on Mobile, Side by Side on Desktop) */}
            <div className="shrink-0 p-6 flex items-center justify-center border-b lg:border-b-0 lg:border-r border-gray-800 bg-gray-900/20">
                <div className="relative h-40 w-40 lg:h-48 lg:w-48">
                    <svg viewBox="0 0 100 100" className="transform -rotate-90 w-full h-full drop-shadow-2xl">
                        {Object.entries(allocation).map(([type, value]) => {
                            const percent = value / total;
                            const circumference = 2 * Math.PI * 40; 
                            const strokeDasharray = `${percent * circumference} ${circumference}`;
                            const strokeDashoffset = -cumulativePercent * circumference;
                            cumulativePercent += percent;
                            
                            const isSelected = selectedType === type;
                            const isDimmed = selectedType && !isSelected;

                            return (
                                <circle
                                    key={type}
                                    cx="50"
                                    cy="50"
                                    r="40"
                                    fill="transparent"
                                    stroke={colors[type] || '#9ca3af'}
                                    strokeWidth={isSelected ? "16" : "12"}
                                    strokeDasharray={strokeDasharray}
                                    strokeDashoffset={strokeDashoffset}
                                    className={`transition-all duration-300 cursor-pointer ${isDimmed ? 'opacity-30' : 'opacity-100 hover:opacity-90'}`}
                                    onMouseEnter={() => setSelectedType(type)}
                                    onMouseLeave={() => setSelectedType(null)}
                                />
                            );
                        })}
                    </svg>
                    
                    {/* Center Label (Adaptive Text Size) */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
                        <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-1">
                            {selectedType || 'TOTAL'}
                        </span>
                        <span className="text-sm lg:text-base font-bold text-white font-mono tracking-tighter">
                            {selectedType 
                                ? formatCompact(allocation[selectedType]) 
                                : formatCompact(total)
                            }
                        </span>
                    </div>
                </div>
            </div>

            {/* 2. DETAILS LIST (Sticky Header + Scroll) */}
            <div className="flex-1 overflow-hidden flex flex-col w-full">
                 <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-black z-20 shadow-lg ring-1 ring-gray-800">
                            <tr className="text-[9px] text-gray-500 font-mono uppercase tracking-wider">
                                <th className="py-2 pl-4 font-medium bg-black">Class / Asset</th>
                                <th className="py-2 pr-2 text-right font-medium bg-black">Value</th>
                                <th className="py-2 pr-4 text-right font-medium bg-black">%</th>
                            </tr>
                        </thead>
                        <tbody className="font-mono text-[10px]">
                            {Object.entries(groupedData).map(([type, data]) => {
                                const percent = ((data.value / total) * 100).toFixed(1);
                                const typeColors = {
                                    'EQTY': 'text-amber-500 bg-amber-950/20 border-amber-900',
                                    'CMDTY': 'text-yellow-500 bg-yellow-950/20 border-yellow-900',
                                    'FX': 'text-green-500 bg-green-950/20 border-green-900',
                                    'CRYPTO': 'text-blue-500 bg-blue-950/20 border-blue-900',
                                };
                                const colorClass = typeColors[type] || 'text-gray-400 bg-gray-900 border-gray-700';
                                const isSelected = selectedType === type;

                                return (
                                    <React.Fragment key={type}>
                                        <tr 
                                            className={`border-b border-gray-800/50 cursor-pointer transition-colors ${isSelected ? 'bg-gray-900' : 'hover:bg-gray-900/30'}`}
                                            onMouseEnter={() => setSelectedType(type)}
                                            onMouseLeave={() => setSelectedType(null)}
                                        >
                                            <td className="py-3 pl-4">
                                                <div className="flex items-center gap-2">
                                                    <span className={`w-2 h-2 rounded-full shadow-[0_0_8px_currentColor] ${colorClass.split(' ')[0]}`}></span>
                                                    <span className={`px-1.5 py-0.5 border rounded-sm text-[9px] font-bold tracking-wider ${colorClass}`}>{type}</span>
                                                    <span className="text-gray-600 text-[9px] ml-1">x{data.count}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 pr-2 text-right text-gray-300 font-medium">
                                                {formatCompact(data.value)}
                                            </td>
                                            <td className="py-3 pr-4 text-right text-gray-500 font-bold group-hover:text-white">
                                                {percent}%
                                            </td>
                                        </tr>
                                    </React.Fragment>
                                )
                            })}
                        </tbody>
                    </table>
                 </div>
            </div>
        </div>
    );
};


const Dashboard = ({ expenses, assets }) => {
  const totalAssets = assets.reduce((acc, curr) => acc + curr.value, 0);
  const totalLiabilities = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const netWorth = totalAssets - totalLiabilities;

  return (
    <div className="grid grid-cols-12 gap-px bg-gray-800 h-full overflow-hidden border border-gray-800">
      
      {/* LEFT COLUMN: KEY METRICS */}
      <div className="col-span-12 lg:col-span-3 flex flex-col gap-px bg-gray-800">
        <TerminalPanel title="NET_LIQ_VALUE" className="h-40">
          <Metric label="Total Equity" value={formatCompact(netWorth)} change={1.2} />
        </TerminalPanel>
        <TerminalPanel title="DAY_P&L" className="h-40">
          <Metric label="Daily Var" value={`+${formatCompact(netWorth * 0.012)}`} change={1.2} />
        </TerminalPanel>
        <TerminalPanel title="EXPOSURE" className="h-40">
          <Metric label="Total Assets" value={formatCompact(totalAssets)} change={0.5} trend="up" />
        </TerminalPanel>
        <TerminalPanel title="LIABILITIES" className="flex-1 min-h-[160px]">
          <Metric label="Outstanding" value={formatCompact(totalLiabilities)} change={-2.4} trend="down" />
        </TerminalPanel>
      </div>

      {/* CENTER: MARKET DATA & CHART PLACEHOLDER */}
      <div className="col-span-12 lg:col-span-6 flex flex-col gap-px bg-gray-800">
         <TerminalPanel 
            title="MARKET_OVERVIEW" 
            className="h-1/2" 
            actions={
                <button className="flex items-center gap-1 text-[9px] font-bold text-amber-600 border border-amber-900/50 bg-amber-950/20 px-2 py-0.5 hover:bg-amber-600 hover:text-black transition-all">
                    MORE <ChevronRight size={8} />
                </button>
            }
         >
            <MarketWidget />
         </TerminalPanel>

         <TerminalPanel title="PORTFOLIO_ALLOCATION" className="flex-1 min-h-[320px]">
            <PortfolioWidget assets={assets} />
         </TerminalPanel>
      </div>

      {/* RIGHT: NEWS / FEED */}
      <div className="col-span-12 lg:col-span-3 flex flex-col gap-px bg-gray-800">
        <TerminalPanel title="LATEST_STORIES" className="flex-1">
          <TradingViewNewsWidget />
        </TerminalPanel>
      </div>
    </div>
  );
};

export default Dashboard;