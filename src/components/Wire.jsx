import React from 'react';
import TerminalPanel from '@/components/TerminalPanel';
import TradingViewTimeline from '@/components/TradingviewWidgets/TradingViewTimeline';
import { Lock, Globe, Calendar, AlertTriangle } from 'lucide-react';

// Dummy Internal Intelligence Data
const PRIVATE_WIRE = [
  { id: 1, title: 'OFFSHORE ACCOUNTS AUDIT', time: '09:45', priority: 'HIGH', category: 'COMPLIANCE', content: 'Annual audit for Cayman trust scheduled for Dec 15. Prepare documents.' },
  { id: 2, title: 'VENTURE CAP CALL', time: '08:30', priority: 'MED', category: 'MEETING', content: 'Series B funding round discussion with Sequoia partners.' },
  { id: 3, title: 'REAL ESTATE ACQUISITION', time: 'YESTERDAY', priority: 'LOW', category: 'ASSET', content: 'Closing documents for Manhattan penthouse ready for signature.' },
  { id: 4, title: 'TAX OPTIMIZATION STRATEGY', time: 'YESTERDAY', priority: 'HIGH', category: 'FINANCE', content: 'Review new tax harvesting opportunities before fiscal year end.' },
];

const ECONOMIC_CALENDAR = [
  { date: 'DEC 12', event: 'FOMC Rate Decision', impact: 'HIGH' },
  { date: 'DEC 14', event: 'CPI Inflation Data', impact: 'HIGH' },
  { date: 'DEC 18', event: 'GDP Growth Rate', impact: 'MED' },
];

const Wire = () => {
  return (
    <div className="grid grid-cols-12 gap-px bg-gray-800 h-full overflow-hidden border border-gray-800">
      
      {/* LEFT: PRIVATE INTELLIGENCE */}
      <div className="col-span-12 lg:col-span-4 flex flex-col gap-px bg-gray-800 h-full">
        <TerminalPanel 
          title="PRIVATE_WIRE // ENCRYPTED" 
          className="flex-1"
          actions={<Lock size={10} className="text-amber-500" />}
        >
          <div className="divide-y divide-gray-800">
            {PRIVATE_WIRE.map((item) => (
              <div key={item.id} className="p-4 hover:bg-gray-900/50 transition-colors group cursor-pointer border-l-2 border-l-transparent hover:border-l-amber-500">
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-[9px] px-1.5 py-0.5 border rounded font-bold ${
                    item.priority === 'HIGH' ? 'text-red-500 border-red-900 bg-red-950/20' : 
                    item.priority === 'MED' ? 'text-amber-500 border-amber-900 bg-amber-950/20' : 
                    'text-blue-500 border-blue-900 bg-blue-950/20'
                  }`}>
                    {item.priority}
                  </span>
                  <span className="text-[10px] font-mono text-gray-600">{item.time}</span>
                </div>
                <h3 className="text-xs font-bold text-gray-200 font-mono mb-1 group-hover:text-amber-500">{item.title}</h3>
                <p className="text-[10px] text-gray-500 leading-relaxed font-mono">{item.content}</p>
              </div>
            ))}
          </div>
        </TerminalPanel>

        <TerminalPanel title="ECONOMIC_CALENDAR" className="h-1/3">
          <div className="p-0">
            <table className="w-full text-left">
              <tbody className="text-[10px] font-mono">
                {ECONOMIC_CALENDAR.map((ev, i) => (
                  <tr key={i} className="border-b border-gray-800 hover:bg-gray-900/30">
                    <td className="p-3 text-amber-600 font-bold">{ev.date}</td>
                    <td className="p-3 text-gray-300">{ev.event}</td>
                    <td className="p-3 text-right">
                      <span className={`px-1 ${ev.impact === 'HIGH' ? 'text-red-500' : 'text-yellow-500'}`}>
                        {ev.impact}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TerminalPanel>
      </div>

      {/* RIGHT: GLOBAL MARKET NEWS */}
      <div className="col-span-12 lg:col-span-8 flex flex-col gap-px bg-gray-800 h-full">
        <TerminalPanel 
          title="GLOBAL_WIRE // PUBLIC_FEED" 
          className="flex-1"
          actions={<Globe size={10} className="text-blue-500" />}
        >
          <div className="h-full w-full bg-black">
            <TradingViewTimeline />
          </div>
        </TerminalPanel>
      </div>

    </div>
  );
};

export default Wire;