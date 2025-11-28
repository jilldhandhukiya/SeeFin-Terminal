import React, { useState } from 'react';
import TerminalPanel from '@/components/TerminalPanel';
import CmdInput from '@/components/CmdInput';
import { formatCurrency } from '@/utils/formatting';

const Ledger = ({ expenses, onAdd, onDelete }) => {
  const [formData, setFormData] = useState({ name: '', amount: '', category: 'OPS' });

  const handleSubmit = (e) => {
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
  }

  return (
    <div className="grid grid-cols-12 gap-px bg-gray-800 h-full">
      <div className="col-span-12 lg:col-span-4 bg-black flex flex-col">
        <TerminalPanel title="NEW_ENTRY // DEBIT" className="h-full">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <CmdInput 
              label="REFERENCE / NAME" 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
              placeholder="ENTER DESCRIPTION" 
            />
            <CmdInput 
              label="AMOUNT (USD)" 
              type="number" 
              value={formData.amount} 
              onChange={e => setFormData({...formData, amount: e.target.value})} 
              placeholder="0.00" 
            />
            
            <div className="space-y-1">
              <label className="text-[9px] text-amber-600 font-mono uppercase">CLASSIFICATION</label>
              <div className="grid grid-cols-3 gap-1">
                {['OPS', 'CAPEX', 'LEGAL', 'TAX', 'MISC'].map(cat => (
                  <button 
                    type="button"
                    key={cat}
                    onClick={() => setFormData({...formData, category: cat})}
                    className={`text-[10px] border py-2 font-mono ${formData.category === cat ? 'bg-amber-600 text-black border-amber-600' : 'text-gray-500 border-gray-700 hover:border-gray-500'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <button className="w-full bg-amber-600 hover:bg-amber-500 text-black font-bold font-mono text-xs uppercase py-3 mt-4 tracking-widest border border-amber-500">
              EXECUTE TRANSACTION
            </button>
          </form>
        </TerminalPanel>
      </div>

      <div className="col-span-12 lg:col-span-8 bg-black flex flex-col">
        <TerminalPanel title="GENERAL_LEDGER" className="h-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-700 text-[10px] text-gray-500 font-mono uppercase tracking-wider">
                <th className="p-3 font-normal">Date</th>
                <th className="p-3 font-normal">Code</th>
                <th className="p-3 font-normal">Description</th>
                <th className="p-3 font-normal">Class</th>
                <th className="p-3 font-normal text-right">Debit</th>
                <th className="p-3 font-normal text-center">Stat</th>
                <th className="p-3 font-normal"></th>
              </tr>
            </thead>
            <tbody className="text-xs font-mono text-gray-300">
              {expenses.map(ex => (
                <tr key={ex.id} className="border-b border-gray-800 hover:bg-gray-900 group">
                  <td className="p-3 text-gray-500">{ex.date.split('T')[0]}</td>
                  <td className="p-3 text-blue-400">{ex.code}</td>
                  <td className="p-3 font-bold text-gray-200">{ex.name}</td>
                  <td className="p-3"><span className="bg-gray-800 text-gray-400 px-1 py-0.5 text-[9px]">{ex.category}</span></td>
                  <td className="p-3 text-right text-red-400 font-medium">{formatCurrency(ex.amount)}</td>
                  <td className="p-3 text-center">
                    <span className={`text-[9px] px-1 border ${ex.status === 'CLEARED' ? 'border-green-900 text-green-600' : 'border-amber-900 text-amber-600'}`}>
                      {ex.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button onClick={() => onDelete(ex.id)} className="text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 uppercase text-[9px]">
                      [DEL]
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TerminalPanel>
      </div>
    </div>
  )
}

export default Ledger;