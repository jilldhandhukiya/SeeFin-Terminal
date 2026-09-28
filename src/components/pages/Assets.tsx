'use client';

import { useState, useMemo } from 'react';
import TerminalPanel from '@/components/ui/TerminalPanel';
import TerminalWorkspace from '@/components/layout/TerminalWorkspace';
import TerminalGrid from '@/components/layout/TerminalGrid';
import Metric from '@/components/ui/Metric';
import { formatCurrency, formatCompact } from '@/utils/formatting';
import {
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Search,
  CheckCircle2,
  RefreshCw,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import React from 'react';
import type { AssetItem, ExpenseItem } from '@/state/appStateData';
import { useAppState } from '@/state/appStateData';

// Holdings Data for Assets
const PORTFOLIO_DATA = [
  { id: '1', symbol: 'BRK.A', name: 'BERKSHIRE HATHAWAY', type: 'EQUITY', qty: 5, price: 625000.0, value: 3125000, change: 1.2, allocation: 45 },
  { id: '2', symbol: 'XAU', name: 'GOLD BULLION (400oz)', type: 'COMMODITY', qty: 12, price: 2350.5, value: 1128240, change: 0.8, allocation: 16 },
  { id: '3', symbol: 'BTC', name: 'BITCOIN COLD STORAGE', type: 'CRYPTO', qty: 15.5, price: 95432.1, value: 1479197, change: 2.4, allocation: 21 },
  { id: '4', symbol: 'VTSAX', name: 'VANGUARD TOTAL STOCK', type: 'FUND', qty: 4500, price: 135.2, value: 608400, change: -0.5, allocation: 9 },
  { id: '5', symbol: 'US-T', name: 'US TREASURY BONDS', type: 'BOND', qty: 5000, price: 98.5, value: 492500, change: 0.1, allocation: 7 },
  { id: '6', symbol: 'CASH', name: 'INR LIQUIDITY', type: 'CASH', qty: 1, price: 145000, value: 145000, change: 0.0, allocation: 2 },
];

type PortfolioWidgetProps = {
  assets: AssetItem[];
};

type AllocationGroup = {
  value: number;
  count: number;
  assets: AssetItem[];
};

const PortfolioWidget = ({ assets }: PortfolioWidgetProps) => {
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const { allocation, total, groupedData } = useMemo(() => {
    const grouped = assets.reduce<Record<string, AllocationGroup>>((acc, asset) => {
      if (!acc[asset.type]) acc[asset.type] = { value: 0, count: 0, assets: [] };
      acc[asset.type].value += asset.value;
      acc[asset.type].count += 1;
      acc[asset.type].assets.push(asset);
      return acc;
    }, {});

    const total = assets.reduce((accumulator: number, current: AssetItem) => accumulator + current.value, 0);
    const allocation = Object.entries(grouped).reduce<Record<string, number>>((accumulator, [key, value]) => {
      accumulator[key] = value.value;
      return accumulator;
    }, {});

    return { allocation, total, groupedData: grouped };
  }, [assets]);

  const colors: Record<string, string> = {
    EQTY: '#f59e0b',
    CMDTY: '#eab308',
    FX: '#22c55e',
    CRYPTO: '#3b82f6',
    CASH: '#64748b',
  };

  let cumulativePercent = 0;

  return (
    <div className="flex flex-col lg:flex-row h-full w-full">
      <div className="shrink-0 p-4 lg:p-5 flex items-center justify-center border-b lg:border-b-0 lg:border-r border-gray-800 bg-gray-900/20">
        <div className="relative h-36 w-36 lg:h-44 lg:w-44">
          <svg viewBox="0 0 100 100" className="transform -rotate-90 w-full h-full drop-shadow-2xl">
            {Object.entries(allocation).map(([type, value]) => {
              const percent = total > 0 ? value / total : 0;
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
                  strokeWidth={isSelected ? '16' : '12'}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className={`transition-all duration-300 cursor-pointer ${isDimmed ? 'opacity-30' : 'opacity-100 hover:opacity-90'}`}
                  onMouseEnter={() => setSelectedType(type)}
                  onMouseLeave={() => setSelectedType(null)}
                />
              );
            })}
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
            <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-1">
              {selectedType || 'TOTAL'}
            </span>
            <span className="text-sm lg:text-base font-bold text-white font-mono tracking-tighter">
              {selectedType ? formatCompact(allocation[selectedType]) : formatCompact(total)}
            </span>
          </div>
        </div>
      </div>

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
                const percent = total > 0 ? ((data.value / total) * 100).toFixed(1) : '0.0';
                const typeColors: Record<string, string> = {
                  EQTY: 'text-amber-500 bg-amber-950/20 border-amber-900',
                  CMDTY: 'text-yellow-500 bg-yellow-950/20 border-yellow-900',
                  FX: 'text-green-500 bg-green-950/20 border-green-900',
                  CRYPTO: 'text-blue-500 bg-blue-950/20 border-blue-900',
                };
                const colorClass = typeColors[type] || 'text-gray-400 bg-gray-900 border-gray-700';
                const isSelected = selectedType === type;

                return (
                  <tr
                    key={type}
                    className={`border-b border-gray-800/50 cursor-pointer transition-colors ${isSelected ? 'bg-gray-900' : 'hover:bg-gray-900/30'}`}
                    onMouseEnter={() => setSelectedType(type)}
                    onMouseLeave={() => setSelectedType(null)}
                  >
                    <td className="py-2.5 pl-4">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full shadow-[0_0_8px_currentColor] ${colorClass.split(' ')[0]}`} />
                        <span className={`px-1.5 py-0.5 border rounded-sm text-[9px] font-bold tracking-wider ${colorClass}`}>{type}</span>
                        <span className="text-gray-600 text-[9px] ml-1">x{data.count}</span>
                      </div>
                    </td>
                    <td className="py-2.5 pr-2 text-right text-gray-300 font-medium">
                      {formatCompact(data.value)}
                    </td>
                    <td className="py-2.5 pr-4 text-right text-gray-500 font-bold group-hover:text-white">
                      {percent}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

type AssetsProps = {
  expenses?: ExpenseItem[];
  assets?: AssetItem[];
};

const Assets = ({ expenses: propExpenses, assets: propAssets }: AssetsProps) => {
  const appState = useAppState();
  const expenses = propExpenses ?? appState.expenses;
  const assets = propAssets ?? appState.assets;

  const [filter, setFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [rebalancing, setRebalancing] = useState(false);
  const [rebalancedToast, setRebalancedToast] = useState(false);

  const totalValue = PORTFOLIO_DATA.reduce((acc, item) => acc + item.value, 0);
  const totalAssets = assets.reduce((acc, curr) => acc + curr.value, 0);
  const totalLiabilities = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const netWorth = totalAssets - totalLiabilities;

  const filteredData = PORTFOLIO_DATA.filter((item) => {
    const matchesCategory = filter === 'ALL' || item.type === filter;
    const matchesSearch =
      searchQuery.trim() === '' ||
      item.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleExecuteRebalance = () => {
    setRebalancing(true);
    setTimeout(() => {
      setRebalancing(false);
      setRebalancedToast(true);
      setTimeout(() => setRebalancedToast(false), 3500);
    }, 800);
  };

  return (
    <TerminalWorkspace
      banner={
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-px bg-zinc-800 border-b border-zinc-800">
          <div className="bg-black h-20 md:h-24">
            <Metric label="NET_LIQ_VALUE" value={formatCompact(netWorth)} change={1.2} />
          </div>
          <div className="bg-black h-20 md:h-24">
            <Metric label="DAY_P&L" value={`+${formatCompact(netWorth * 0.012)}`} change={1.2} />
          </div>
          <div className="bg-black h-20 md:h-24">
            <Metric label="EXPOSURE" value={formatCompact(totalAssets)} change={0.5} trend="up" />
          </div>
          <div className="bg-black h-20 md:h-24">
            <Metric label="LIABILITIES" value={formatCompact(totalLiabilities)} change={-2.4} trend="down" />
          </div>
          <div className="bg-black h-20 md:h-24 col-span-2 md:col-span-1">
            <Metric label="Total AUM" value={formatCurrency(totalValue)} change={1.4} trend="up" />
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-1 md:gap-1.5 w-full flex-1">
        {/* ROW 1: Portfolio Overview & Risk Analysis */}
        <TerminalGrid variant="split-7-5" className="min-h-[250px] md:min-h-[270px]">
          {/* Pad 1: Portfolio Allocation Donut & Summary */}
          <div className="xl:col-span-7 flex flex-col min-h-0 h-full">
            <TerminalPanel
              title="PORTFOLIO_ALLOCATION"
              className="h-full"
              footer={
                <>
                  <span>TARGET WEIGHT: HARMONIZED</span>
                  <span className="text-emerald-400">ACTIVE DESK // LIVE</span>
                </>
              }
            >
              <PortfolioWidget assets={assets} />
            </TerminalPanel>
          </div>

          {/* Pad 2: Risk Analysis Desk */}
          <div className="xl:col-span-5 flex flex-col min-h-0 h-full">
            <TerminalPanel
              title="RISK_ANALYSIS"
              className="h-full"
              footer={
                <>
                  <span className="text-emerald-400 font-mono">● RISK ENCLAVE: ACTIVE</span>
                  <span>CONFIDENCE: 99.2%</span>
                </>
              }
            >
              <div className="p-4 flex flex-col justify-between h-full gap-3 font-mono">
                {/* Volatility & Liquidity Gauges */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                      <span>VOLATILITY INDEX</span>
                      <span className="text-emerald-400 font-bold">14.2 // LOW</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 w-1/4" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                      <span>LIQUIDITY SCORE</span>
                      <span className="text-amber-500 font-bold">88/100 // HIGH</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 w-3/4" />
                    </div>
                  </div>
                </div>

                {/* Quantitative Risk Stats */}
                <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-zinc-950/80 border border-zinc-800/80 text-[10px]">
                  <div>
                    <span className="text-zinc-500 block text-[9px] uppercase">Sharpe Ratio</span>
                    <span className="text-emerald-400 font-bold">2.41</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[9px] uppercase">95% Daily VaR</span>
                    <span className="text-amber-400 font-bold">₹18,400</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[9px] uppercase">Beta vs NIFTY</span>
                    <span className="text-zinc-200 font-bold">0.84</span>
                  </div>
                </div>

                {/* Advisor Note */}
                <div className="p-3 bg-gray-900/40 border border-gray-800 rounded">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-[10px] font-bold text-zinc-300 uppercase tracking-wider">Advisor Note</h4>
                    <span className="text-[9px] text-amber-500 font-bold">REBALANCE_SUGGESTED</span>
                  </div>
                  <p className="text-[10px] text-gray-400 leading-relaxed font-mono">
                    Portfolio is currently overweight in Equities. Consider rebalancing into Fixed Income instruments to hedge against upcoming rate decisions.
                  </p>
                </div>
              </div>
            </TerminalPanel>
          </div>
        </TerminalGrid>

        {/* ROW 2: Detailed Asset Allocation Matrix & Quick Actions Pad */}
        <TerminalGrid variant="split-8-4" className="min-h-[320px] md:min-h-[350px] flex-1">
          {/* Pad 3: Detailed Holdings Table */}
          <div className="xl:col-span-8 flex flex-col min-h-0 h-full">
            <TerminalPanel
              title="ASSET_ALLOCATION_MATRIX"
              className="h-full"
              actions={
                <div className="flex items-center gap-2">
                  <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 bg-zinc-950 border border-zinc-800 text-[9px] font-mono text-zinc-400">
                    <Search size={10} className="text-zinc-500" />
                    <input
                      type="text"
                      placeholder="FILTER SYMBOL..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-transparent border-none outline-none text-zinc-200 placeholder-zinc-600 w-24 uppercase text-[9px]"
                    />
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {['ALL', 'EQUITY', 'COMMODITY', 'CRYPTO', 'FUND', 'BOND', 'CASH'].map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setFilter(f)}
                        className={`px-2 py-0.5 text-[9px] font-mono border transition-colors cursor-pointer ${
                          filter === f
                            ? 'bg-amber-600 text-black border-amber-600 font-bold'
                            : 'text-gray-400 border-gray-800 hover:border-gray-600 hover:text-white'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
              }
              footer={
                <>
                  <span className="font-mono text-zinc-500">
                    DISPLAYING {filteredData.length} OF {PORTFOLIO_DATA.length} ASSETS
                  </span>
                  <span className="font-mono text-zinc-400">
                    TOTAL ALLOCATED: <strong className="text-amber-500">{formatCurrency(totalValue)}</strong>
                  </span>
                </>
              }
            >
              <div className="h-full overflow-auto custom-scrollbar">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="sticky top-0 bg-black z-10 shadow-sm">
                    <tr className="text-[9px] text-gray-500 font-mono uppercase tracking-wider border-b border-gray-800">
                      <th className="p-2 md:p-3 font-normal">Symbol</th>
                      <th className="p-2 md:p-3 font-normal">Type</th>
                      <th className="p-2 md:p-3 font-normal text-right">Units</th>
                      <th className="p-2 md:p-3 font-normal text-right">Unit Price</th>
                      <th className="p-2 md:p-3 font-normal text-right">Market Value</th>
                      <th className="p-2 md:p-3 font-normal text-right">% Alloc</th>
                      <th className="p-2 md:p-3 font-normal text-right">24h Chg</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs font-mono text-gray-300">
                    {filteredData.map((asset) => (
                      <tr key={asset.id} className="border-b border-gray-800/50 hover:bg-gray-900/50 group transition-colors cursor-default">
                        <td className="p-2 md:p-3">
                          <div className="flex flex-col">
                            <span className="font-bold text-amber-500 group-hover:underline text-[10px]">{asset.symbol}</span>
                            <span className="text-[8px] text-gray-500 hidden md:block">{asset.name}</span>
                          </div>
                        </td>
                        <td className="p-2 md:p-3">
                          <span className="px-1.5 py-0.5 border border-gray-700 rounded-sm text-[8px] md:text-[9px] text-gray-300 font-mono">
                            {asset.type}
                          </span>
                        </td>
                        <td className="p-2 md:p-3 text-right text-gray-400 text-[10px] font-mono">
                          {asset.qty.toLocaleString()}
                        </td>
                        <td className="p-2 md:p-3 text-right text-gray-400 text-[10px] font-mono">
                          {formatCurrency(asset.price)}
                        </td>
                        <td className="p-2 md:p-3 text-right text-zinc-200 font-bold text-[10px] font-mono">
                          {formatCurrency(asset.value)}
                        </td>
                        <td className="p-2 md:p-3 text-right text-zinc-400 text-[10px] font-mono">
                          {asset.allocation}%
                        </td>
                        <td className={`p-2 md:p-3 text-right font-bold text-[10px] font-mono ${asset.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {asset.change > 0 ? '+' : ''}{asset.change}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TerminalPanel>
          </div>

          {/* Pad 4: Quick Actions & Rebalance Controls */}
          <div className="xl:col-span-4 flex flex-col min-h-0 h-full">
            <TerminalPanel
              title="QUICK_ACTIONS"
              className="h-full"
              footer={
                <>
                  <span className="flex items-center gap-1 text-emerald-400">
                    <ShieldCheck size={11} /> T+1 SETTLEMENT READY
                  </span>
                  <span>AUTONOMOUS DESK</span>
                </>
              }
            >
              <div className="p-3.5 flex flex-col justify-between h-full gap-4 font-mono">
                {/* 4 Action Buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button className="flex flex-col items-center justify-center p-2.5 border border-gray-800 bg-zinc-950/60 hover:border-amber-500 hover:bg-amber-950/20 transition-all group cursor-pointer">
                    <ArrowUpRight className="text-gray-400 group-hover:text-amber-500 mb-1" size={15} />
                    <span className="text-[9px] uppercase text-gray-300 group-hover:text-amber-500 font-bold">Deposit</span>
                  </button>
                  <button className="flex flex-col items-center justify-center p-2.5 border border-gray-800 bg-zinc-950/60 hover:border-amber-500 hover:bg-amber-950/20 transition-all group cursor-pointer">
                    <ArrowDownRight className="text-gray-400 group-hover:text-amber-500 mb-1" size={15} />
                    <span className="text-[9px] uppercase text-gray-300 group-hover:text-amber-500 font-bold">Withdraw</span>
                  </button>
                  <button
                    onClick={handleExecuteRebalance}
                    className="flex flex-col items-center justify-center p-2.5 border border-gray-800 bg-zinc-950/60 hover:border-amber-500 hover:bg-amber-950/20 transition-all group cursor-pointer"
                  >
                    <PieChart className="text-gray-400 group-hover:text-amber-500 mb-1" size={15} />
                    <span className="text-[9px] uppercase text-gray-300 group-hover:text-amber-500 font-bold">Rebalance</span>
                  </button>
                  <button className="flex flex-col items-center justify-center p-2.5 border border-gray-800 bg-zinc-950/60 hover:border-amber-500 hover:bg-amber-950/20 transition-all group cursor-pointer">
                    <Download className="text-gray-400 group-hover:text-amber-500 mb-1" size={15} />
                    <span className="text-[9px] uppercase text-gray-300 group-hover:text-amber-500 font-bold">Report</span>
                  </button>
                </div>

                {/* Portfolio Rebalance Drift Assistant */}
                <div className="p-3 bg-zinc-950 border border-zinc-800 space-y-2.5 text-[10px]">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400 font-bold uppercase flex items-center gap-1.5">
                      <Zap size={11} className="text-amber-500" />
                      Rebalance Drift Monitor
                    </span>
                    <span className="text-amber-500 text-[9px] font-bold">DRIFT: +3.8%</span>
                  </div>

                  <div className="space-y-1.5 text-[9px]">
                    <div className="flex justify-between text-zinc-400">
                      <span>Equities (Target 40%)</span>
                      <span className="text-amber-400">45% (+5%)</span>
                    </div>
                    <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 w-[45%]" />
                    </div>

                    <div className="flex justify-between text-zinc-400">
                      <span>Bonds / Fixed (Target 15%)</span>
                      <span className="text-rose-400">7% (-8%)</span>
                    </div>
                    <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-500 w-[7%]" />
                    </div>
                  </div>

                  <button
                    onClick={handleExecuteRebalance}
                    disabled={rebalancing}
                    className="w-full mt-2 py-1.5 bg-amber-500/10 border border-amber-500/40 hover:bg-amber-500 text-amber-400 hover:text-black font-bold uppercase text-[9px] transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw size={10} className={rebalancing ? 'animate-spin' : ''} />
                    {rebalancing ? 'CALCULATING SIZING...' : 'EXECUTE AUTO-REBALANCE'}
                  </button>

                  {rebalancedToast && (
                    <div className="text-emerald-400 text-[9px] font-bold flex items-center gap-1 mt-1">
                      <CheckCircle2 size={11} />
                      Portfolio rebalanced to benchmark targets!
                    </div>
                  )}
                </div>
              </div>
            </TerminalPanel>
          </div>
        </TerminalGrid>
      </div>
    </TerminalWorkspace>
  );
};

export default Assets;
