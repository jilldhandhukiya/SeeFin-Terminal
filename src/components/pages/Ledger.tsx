'use client';

import React, { useState } from 'react';
import TerminalWorkspace from '@/components/layout/TerminalWorkspace';
import TerminalGrid from '@/components/layout/TerminalGrid';
import TerminalPanel from '@/components/ui/TerminalPanel';
import CmdInput from '@/components/ui/CmdInput';
import { formatCurrency } from '@/utils/formatting';
import { useAppState } from '@/state/appStateData';
import { CreditCard, FileSpreadsheet, PlusCircle, ShieldCheck } from 'lucide-react';

type Expense = {
  id: string | number;
  name: string;
  amount: number;
  category: string;
  code: string;
  date: string;
  status: string;
};

type LedgerProps = {
  expenses?: Expense[];
  onAdd?: (e: Omit<Expense, 'id'> & { id?: string | number }) => void;
  onDelete?: (id: string | number) => void;
};

const Ledger: React.FC<LedgerProps> = ({ expenses: propExpenses, onAdd: propOnAdd, onDelete: propOnDelete }) => {
  const appState = useAppState();
  const expenses = propExpenses ?? appState.expenses;
  const onAdd = propOnAdd ?? appState.addExpense;
  const onDelete = propOnDelete ?? appState.deleteExpense;

  const [formData, setFormData] = useState<{ name: string; amount: string; category: string }>({ name: '', amount: '', category: 'OPS' });

  const totalDebits = expenses.reduce((acc, ex) => acc + ex.amount, 0);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if(!formData.name || !formData.amount) return;
    onAdd({
      ...formData, 
      amount: parseFloat(formData.amount), 
      code: `TRX-${Math.floor(Math.random()*1000)}`, 
      date: new Date().toISOString(), 
      status: 'PENDING'
    });
    setFormData({ name: '', amount: '', category: 'OPS' });
  };

  return (
    <TerminalWorkspace>
      <TerminalGrid variant="split-4-8" className="min-h-[560px]">
        {/* Left Pad: New Entry Form */}
        <div className="xl:col-span-4 flex flex-col min-h-[440px]">
          <TerminalPanel
            title="NEW_ENTRY // DEBIT"
            actions={<CreditCard size={11} className="text-amber-500" />}
            footer={
              <>
                <span className="flex items-center gap-1 text-emerald-400">
                  <ShieldCheck size={10} /> DUAL-LEDGER VERIFIED
                </span>
                <span>ENTRY ID AUTO-KEY</span>
              </>
            }
          >
            <form onSubmit={handleSubmit} className="p-5 md:p-6 space-y-5">
              <CmdInput 
                label="REFERENCE / NAME" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                placeholder="ENTER DESCRIPTION" 
              />
              <CmdInput 
                label="AMOUNT (INR)" 
                type="number" 
                value={formData.amount} 
                onChange={e => setFormData({...formData, amount: e.target.value})} 
                placeholder="0.00" 
              />
              
              <div className="space-y-1.5">
                <label className="text-[9px] text-amber-500 font-mono uppercase tracking-wider">CLASSIFICATION</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {['OPS', 'CAPEX', 'LEGAL', 'TAX', 'MISC'].map(cat => (
                    <button 
                      type="button"
                      key={cat}
                      onClick={() => setFormData({...formData, category: cat})}
                      className={`text-[9px] border py-2 font-mono uppercase transition-colors cursor-pointer ${formData.category === cat ? 'bg-amber-600 text-black border-amber-600 font-bold' : 'text-zinc-400 border-zinc-800 hover:border-zinc-600 hover:text-white'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <button className="w-full bg-amber-600 hover:bg-amber-500 text-black font-bold font-mono text-xs uppercase py-3 mt-4 tracking-widest border border-amber-500 transition-colors flex items-center justify-center gap-2 cursor-pointer">
                <PlusCircle size={13} />
                EXECUTE TRANSACTION
              </button>
            </form>
          </TerminalPanel>
        </div>

        {/* Right Pad: General Ledger Table */}
        <div className="xl:col-span-8 flex flex-col min-h-[440px]">
          <TerminalPanel
            title="GENERAL_LEDGER"
            actions={<FileSpreadsheet size={11} className="text-sky-400" />}
            footer={
              <>
                <span>AUDIT TRAIL: IMMUTABLE ROW STORE</span>
                <span className="text-zinc-300 font-semibold">TOTAL DEBITS: {formatCurrency(totalDebits)}</span>
              </>
            }
          >
            <div className="h-full overflow-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[560px]">
                <thead className="sticky top-0 bg-black z-10 shadow-xs">
                  <tr className="border-b border-zinc-800 text-[9px] text-zinc-500 font-mono uppercase tracking-wider">
                    <th className="p-3 font-normal">Date</th>
                    <th className="p-3 font-normal">Code</th>
                    <th className="p-3 font-normal">Description</th>
                    <th className="p-3 font-normal">Class</th>
                    <th className="p-3 font-normal text-right">Debit</th>
                    <th className="p-3 font-normal text-center">Stat</th>
                    <th className="p-3 font-normal text-right"></th>
                  </tr>
                </thead>
                <tbody className="text-xs font-mono text-zinc-300 divide-y divide-zinc-850">
                  {expenses.map(ex => (
                    <tr key={ex.id} className="hover:bg-zinc-900/40 group transition-colors">
                      <td className="p-3 text-zinc-500">{ex.date.split('T')[0]}</td>
                      <td className="p-3 text-sky-400">{ex.code}</td>
                      <td className="p-3 font-semibold text-zinc-200">{ex.name}</td>
                      <td className="p-3"><span className="bg-zinc-900 border border-zinc-800 text-zinc-400 px-1.5 py-0.5 text-[8px] rounded-xs">{ex.category}</span></td>
                      <td className="p-3 text-right text-rose-400 font-medium">{formatCurrency(ex.amount)}</td>
                      <td className="p-3 text-center">
                        <span className={`text-[8px] px-1.5 py-0.5 border rounded-xs font-semibold ${ex.status === 'CLEARED' ? 'border-emerald-900 bg-emerald-950/30 text-emerald-400' : 'border-amber-900 bg-amber-950/30 text-amber-400'}`}>
                          {ex.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button onClick={() => onDelete(ex.id)} className="text-zinc-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 uppercase text-[9px] font-bold cursor-pointer transition-opacity">
                          [DEL]
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TerminalPanel>
        </div>
      </TerminalGrid>
    </TerminalWorkspace>
  );
};

export default Ledger;
