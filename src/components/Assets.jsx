import React, { useState } from 'react';
import TerminalPanel from '@/components/TerminalPanel';
import Metric from '@/components/Metric';
import { formatCurrency, formatCompact } from '@/utils/formatting';
import { PieChart, ArrowUpRight, ArrowDownRight, Filter, Download } from 'lucide-react';

// Dummy Data for Assets
const PORTFOLIO_DATA = [
  { id: '1', symbol: 'BRK.A', name: 'BERKSHIRE HATHAWAY', type: 'EQUITY', qty: 5, price: 625000.00, value: 3125000, change: 1.2, allocation: 45 },
  { id: '2', symbol: 'XAU', name: 'GOLD BULLION (400oz)', type: 'COMMODITY', qty: 12, price: 2350.50, value: 1128240, change: 0.8, allocation: 16 },
  { id: '3', symbol: 'BTC', name: 'BITCOIN COLD STORAGE', type: 'CRYPTO', qty: 15.5, price: 95432.10, value: 1479197, change: 2.4, allocation: 21 },
  { id: '4', symbol: 'VTSAX', name: 'VANGUARD TOTAL STOCK', type: 'FUND', qty: 4500, price: 135.20, value: 608400, change: -0.5, allocation: 9 },
  { id: '5', symbol: 'US-T', name: 'US TREASURY BONDS', type: 'BOND', qty: 5000, price: 98.50, value: 492500, change: 0.1, allocation: 7 },
  { id: '6', symbol: 'CASH', name: 'USD LIQUIDITY', type: 'CASH', qty: 1, price: 145000, value: 145000, change: 0.0, allocation: 2 },
];

const Assets = () => {
  const [filter, setFilter] = useState('ALL');
  
  const totalValue = PORTFOLIO_DATA.reduce((acc, item) => acc + item.value, 0);
  const dayChangeValue = PORTFOLIO_DATA.reduce((acc, item) => acc + (item.value * (item.change / 100)), 0);
  
  const filteredData = filter === 'ALL' 
    ? PORTFOLIO_DATA 
    : PORTFOLIO_DATA.filter(item => item.type === filter);

  return (
    <div className="grid grid-cols-12 gap-px bg-gray-800 h-full overflow-hidden border border-gray-800">
      
      {/* TOP METRICS ROW */}
      <div className="col-span-12 h-32 flex gap-px bg-gray-800 shrink-0">
        <div className="flex-1 bg-black border-r border-gray-800">
           <Metric label="Total AUM" value={formatCurrency(totalValue)} change={1.4} trend="up" />
        </div>
        <div className="flex-1 bg-black border-r border-gray-800">
           <Metric label="Day P&L" value={`+${formatCurrency(dayChangeValue)}`} change={1.4} trend="up" />
        </div>
        <div className="flex-1 bg-black border-r border-gray-800">
           <Metric label="Cash Ratio" value="2.1%" change={-0.5} trend="down" />
        </div>
        <div className="flex-1 bg-black">
           <Metric label="YTD Return" value="+18.4%" change={0.2} trend="up" />
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="col-span-12 lg:col-span-9 flex flex-col gap-px bg-gray-800 h-full overflow-hidden">
        <TerminalPanel 
          title="ASSET_ALLOCATION_MATRIX" 
          className="flex-1"
          actions={
            <div className="flex gap-1">
              {['ALL', 'EQUITY', 'CRYPTO', 'COMMODITY'].map(f => (
                <button 
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-2 py-0.5 text-[9px] font-mono border ${filter === f ? 'bg-amber-600 text-black border-amber-600' : 'text-gray-500 border-gray-700 hover:border-gray-500'}`}
                >
                  {f}
                </button>
              ))}
            </div>
          }
        >
          <div className="h-full overflow-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-black z-10 shadow-sm">
                <tr className="text-[9px] text-gray-500 font-mono uppercase tracking-wider border-b border-gray-800">
                  <th className="p-3 font-normal">Symbol / Name</th>
                  <th className="p-3 font-normal">Type</th>
                  <th className="p-3 font-normal text-right">Quantity</th>
                  <th className="p-3 font-normal text-right">Price</th>
                  <th className="p-3 font-normal text-right">Market Value</th>
                  <th className="p-3 font-normal text-right">Allocation</th>
                  <th className="p-3 font-normal text-right">24h %</th>
                </tr>
              </thead>
              <tbody className="text-xs font-mono text-gray-300">
                {filteredData.map((asset) => (
                  <tr key={asset.id} className="border-b border-gray-800/50 hover:bg-gray-900/50 group transition-colors cursor-default">
                    <td className="p-3">
                      <div className="flex flex-col">
                        <span className="font-bold text-amber-500 group-hover:underline">{asset.symbol}</span>
                        <span className="text-[9px] text-gray-500">{asset.name}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="px-1.5 py-0.5 border border-gray-700 rounded text-[9px] text-gray-400">{asset.type}</span>
                    </td>
                    <td className="p-3 text-right text-gray-400">{formatCompact(asset.qty)}</td>
                    <td className="p-3 text-right text-gray-400">{formatCurrency(asset.price)}</td>
                    <td className="p-3 text-right font-bold text-gray-200">{formatCurrency(asset.value)}</td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-[10px] text-gray-500">{asset.allocation}%</span>
                        <div className="w-12 h-1 bg-gray-800 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-600" style={{width: `${asset.allocation}%`}}></div>
                        </div>
                      </div>
                    </td>
                    <td className={`p-3 text-right font-bold ${asset.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {asset.change > 0 ? '+' : ''}{asset.change}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TerminalPanel>
      </div>

      {/* RIGHT SIDEBAR: ACTIONS & DETAILS */}
      <div className="col-span-12 lg:col-span-3 flex flex-col gap-px bg-gray-800 h-full">
        <TerminalPanel title="QUICK_ACTIONS" className="h-1/3">
          <div className="p-4 grid grid-cols-2 gap-2">
            <button className="flex flex-col items-center justify-center p-3 border border-gray-700 hover:border-amber-500 hover:bg-amber-950/20 transition-all group">
              <ArrowUpRight className="text-gray-500 group-hover:text-amber-500 mb-2" size={20} />
              <span className="text-[9px] font-mono uppercase text-gray-400 group-hover:text-amber-500">Deposit</span>
            </button>
            <button className="flex flex-col items-center justify-center p-3 border border-gray-700 hover:border-amber-500 hover:bg-amber-950/20 transition-all group">
              <ArrowDownRight className="text-gray-500 group-hover:text-amber-500 mb-2" size={20} />
              <span className="text-[9px] font-mono uppercase text-gray-400 group-hover:text-amber-500">Withdraw</span>
            </button>
            <button className="flex flex-col items-center justify-center p-3 border border-gray-700 hover:border-amber-500 hover:bg-amber-950/20 transition-all group">
              <PieChart className="text-gray-500 group-hover:text-amber-500 mb-2" size={20} />
              <span className="text-[9px] font-mono uppercase text-gray-400 group-hover:text-amber-500">Rebalance</span>
            </button>
            <button className="flex flex-col items-center justify-center p-3 border border-gray-700 hover:border-amber-500 hover:bg-amber-950/20 transition-all group">
              <Download className="text-gray-500 group-hover:text-amber-500 mb-2" size={20} />
              <span className="text-[9px] font-mono uppercase text-gray-400 group-hover:text-amber-500">Report</span>
            </button>
          </div>
        </TerminalPanel>

        <TerminalPanel title="RISK_ANALYSIS" className="flex-1">
          <div className="p-4 space-y-4">
            <div>
              <div className="flex justify-between text-[10px] font-mono text-gray-500 mb-1">
                <span>VOLATILITY INDEX</span>
                <span className="text-amber-500">LOW</span>
              </div>
              <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 w-1/4"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[10px] font-mono text-gray-500 mb-1">
                <span>LIQUIDITY SCORE</span>
                <span className="text-amber-500">HIGH</span>
              </div>
              <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 w-3/4"></div>
              </div>
            </div>
            <div className="p-3 bg-gray-900/50 border border-gray-800 rounded mt-4">
              <h4 className="text-[10px] font-bold text-gray-400 mb-2 uppercase">Advisor Note</h4>
              <p className="text-[10px] text-gray-500 leading-relaxed">
                Portfolio is currently overweight in Equities. Consider rebalancing into Fixed Income instruments to hedge against upcoming rate decisions.
              </p>
            </div>
          </div>
        </TerminalPanel>
      </div>
    </div>
  );
};

export default Assets;