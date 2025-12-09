'use client';
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import CommandBar from '@/components/CommandBar';
import Dashboard from '@/components/Dashboard';
import Ledger from '@/components/Ledger';
import Assets from '@/components/Assets';
import Wire from '@/components/Wire';
import LoadingModule from '@/components/LoadingModule';
import { getCurrentTime } from '@/utils/formatting';

const INITIAL_EXPENSES = [
  { id: '1', code: 'TRN-001', name: 'GULFSTREAM MAINT', amount: 15000, category: 'LOGISTICS', date: '2025-11-01', status: 'CLEARED' },
  { id: '2', code: 'LIF-092', name: 'CONCIERGE RETAINER', amount: 2500, category: 'SERVICES', date: '2025-11-03', status: 'PENDING' },
  { id: '3', code: 'RES-404', name: 'PENTHOUSE LEASE', amount: 12000, category: 'HOUSING', date: '2025-11-05', status: 'CLEARED' },
  { id: '4', code: 'SEC-112', name: 'SECURITY DETAIL', amount: 4500, category: 'PROTECTION', date: '2025-11-06', status: 'CLEARED' },
];

const INITIAL_ASSETS = [
  { id: '1', symbol: 'BRK.A', name: 'BERKSHIRE HATHAWAY', type: 'EQTY', value: 450000, change: 12.5, allocation: 35 },
  { id: '2', symbol: 'XAU', name: 'GOLD BULLION', type: 'CMDTY', value: 125000, change: 4.2, allocation: 15 },
  { id: '3', symbol: 'KY-TR', name: 'OFFSHORE TRUST', type: 'FX', value: 800000, change: 0.5, allocation: 50 },
];

/**
 * --- MAIN APP ---
 */
const App = () => {
  const [activeTab, setActiveTab] = useState('DASH');
  const [time, setTime] = useState(getCurrentTime());
  const [expenses, setExpenses] = useState(INITIAL_EXPENSES);
  const [assets, _] = useState(INITIAL_ASSETS);

  useEffect(() => {
    const interval = setInterval(() => setTime(getCurrentTime()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-black text-gray-300 font-sans selection:bg-amber-500 selection:text-black flex flex-col overflow-hidden">
      
      {/* PERSISTENT HEADER */}
      <Header time={time} />

      {/* MAIN WORKSPACE */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* PERSISTENT SIDEBAR */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* CONTENT AREA */}
        <main className="flex-1 bg-gray-900 relative flex flex-col overflow-hidden">
          {/* COMMAND BAR */}
          <CommandBar activeTab={activeTab} />

          {/* PAGE CONTENT */}
          <div className="flex-1 p-0.5 overflow-hidden">
            {activeTab === 'DASH' && <Dashboard expenses={expenses} assets={assets} />}
            {activeTab === 'EXP' && <Ledger expenses={expenses} onAdd={(item) => setExpenses(prev => [...prev, {...item, id: Math.random()}])} onDelete={(id) => setExpenses(prev => prev.filter(x => x.id !== id))} />}
            {activeTab === 'ASST' && <Assets />}
            {activeTab === 'NEWS' && <Wire />}
          </div>
        </main>

      </div>
    </div>
  );
};

export default App;