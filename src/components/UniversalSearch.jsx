import React, { useState, useEffect, useRef } from 'react';
import { Search, TrendingUp, DollarSign, BarChart3, Globe, X } from 'lucide-react';

// Dummy data for commands and search results
const DUMMY_COMMANDS = [
  { id: '1', command: 'GOOGL', description: 'Google Inc. (Alphabet)', type: 'EQUITY', category: 'TECH' },
  { id: '2', command: 'AAPL', description: 'Apple Inc.', type: 'EQUITY', category: 'TECH' },
  { id: '3', command: 'BTCUSD', description: 'Bitcoin vs US Dollar', type: 'CRYPTO', category: 'DIGITAL' },
  { id: '4', command: 'SPX', description: 'S&P 500 Index', type: 'INDEX', category: 'EQUITY' },
  { id: '5', command: 'EURUSD', description: 'Euro vs US Dollar', type: 'FX', category: 'CURRENCY' },
  { id: '6', command: 'CL1:COM', description: 'WTI Crude Oil', type: 'COMMODITY', category: 'ENERGY' },
  { id: '7', command: 'DES', description: 'Dashboard', type: 'NAVIGATION', category: 'SYSTEM' },
  { id: '8', command: 'LED', description: 'Ledger', type: 'NAVIGATION', category: 'SYSTEM' },
];

const DUMMY_SEARCH_RESULTS = [
  { id: '1', title: 'Federal Reserve Interest Rate Decision', type: 'NEWS', source: 'Bloomberg', date: '2025-12-09' },
  { id: '2', title: 'Tesla Q4 Earnings Report', type: 'FINANCIAL', source: 'Reuters', date: '2025-12-08' },
  { id: '3', title: 'Cryptocurrency Market Analysis', type: 'ANALYSIS', source: 'CoinDesk', date: '2025-12-07' },
  { id: '4', title: 'Global Economic Outlook 2026', type: 'REPORT', source: 'IMF', date: '2025-12-06' },
];

const UniversalSearch = ({ onClose }) => {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('commands');
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
    
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const filteredCommands = DUMMY_COMMANDS.filter(item =>
    item.command.toLowerCase().includes(query.toLowerCase()) ||
    item.description.toLowerCase().includes(query.toLowerCase())
  );

  const filteredResults = DUMMY_SEARCH_RESULTS.filter(item =>
    item.title.toLowerCase().includes(query.toLowerCase())
  );

  const getIcon = (type) => {
    switch(type) {
      case 'EQUITY': return <TrendingUp size={14} />;
      case 'CRYPTO': return <DollarSign size={14} />;
      case 'INDEX': return <BarChart3 size={14} />;
      case 'FX': return <Globe size={14} />;
      case 'NEWS': return <Globe size={14} />;
      case 'FINANCIAL': return <BarChart3 size={14} />;
      case 'ANALYSIS': return <TrendingUp size={14} />;
      case 'REPORT': return <BarChart3 size={14} />;
      default: return <Search size={14} />;
    }
  };

  const getTypeColor = (type) => {
    switch(type) {
      case 'EQUITY': return 'text-green-500 bg-green-950/20 border-green-900';
      case 'CRYPTO': return 'text-blue-500 bg-blue-950/20 border-blue-900';
      case 'INDEX': return 'text-purple-500 bg-purple-950/20 border-purple-900';
      case 'FX': return 'text-cyan-500 bg-cyan-950/20 border-cyan-900';
      case 'NEWS': return 'text-yellow-500 bg-yellow-950/20 border-yellow-900';
      case 'FINANCIAL': return 'text-red-500 bg-red-950/20 border-red-900';
      case 'ANALYSIS': return 'text-orange-500 bg-orange-950/20 border-orange-900';
      case 'REPORT': return 'text-pink-500 bg-pink-950/20 border-pink-900';
      default: return 'text-gray-500 bg-gray-950/20 border-gray-700';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-lg z-50 flex items-center justify-center p-4 transition-all duration-300 ease-in-out">
      <div className="w-full max-w-2xl bg-gray-900/95 border border-gray-700/50 rounded-lg shadow-2xl overflow-hidden backdrop-blur-sm">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800/50">
          <h2 className="text-lg font-mono font-bold text-amber-500 uppercase tracking-wider">Universal Search</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-amber-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b border-gray-800/50">
          <div className="flex items-center bg-black/50 border border-gray-600/50 rounded px-3 py-2 focus-within:border-amber-500/70 backdrop-blur-sm">
            <Search size={16} className="text-amber-600 mr-2" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search commands, symbols, news..."
              className="flex-1 bg-transparent border-none outline-none text-gray-200 font-mono text-sm placeholder:text-gray-600"
            />
            <div className="text-[10px] text-gray-600 font-mono ml-2">
              ESC to close
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-800/50">
          {[
            { id: 'commands', label: 'Commands', count: filteredCommands.length },
            { id: 'search', label: 'Search', count: filteredResults.length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 px-4 text-sm font-mono font-bold uppercase tracking-wider transition-colors ${
                activeTab === tab.id 
                  ? 'bg-amber-600/90 text-black border-b-2 border-amber-500' 
                  : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/50'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="max-h-96 overflow-y-auto">
          {activeTab === 'commands' && (
            <div className="divide-y divide-gray-800/50">
              {filteredCommands.length > 0 ? (
                filteredCommands.map(item => (
                  <div key={item.id} className="flex items-center p-4 hover:bg-gray-800/50 cursor-pointer group transition-colors">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="text-amber-500">
                        {getIcon(item.type)}
                      </div>
                      <div>
                        <div className="text-sm font-mono font-bold text-amber-500 group-hover:text-amber-400">
                          {item.command}
                        </div>
                        <div className="text-xs text-gray-500 uppercase">
                          {item.description}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 border rounded text-[10px] font-bold ${getTypeColor(item.type)}`}>
                        {item.type}
                      </span>
                      <span className="text-[10px] text-gray-600 font-mono uppercase">
                        {item.category}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-600">
                  <Search size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="font-mono text-sm">No commands found</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'search' && (
            <div className="divide-y divide-gray-800/50">
              {filteredResults.length > 0 ? (
                filteredResults.map(item => (
                  <div key={item.id} className="flex items-center p-4 hover:bg-gray-800/50 cursor-pointer group transition-colors">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="text-amber-500">
                        {getIcon(item.type)}
                      </div>
                      <div>
                        <div className="text-sm font-mono font-bold text-gray-200 group-hover:text-amber-400">
                          {item.title}
                        </div>
                        <div className="text-xs text-gray-500 uppercase">
                          {item.source} • {item.date}
                        </div>
                      </div>
                    </div>
                    <span className={`px-2 py-1 border rounded text-[10px] font-bold ${getTypeColor(item.type)}`}>
                      {item.type}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-600">
                  <Search size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="font-mono text-sm">No results found</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-gray-950/80 border-t border-gray-800/50 text-center backdrop-blur-sm">
          <p className="text-[10px] text-gray-600 font-mono">
            Press <kbd className="bg-gray-800/50 px-1 rounded">↑↓</kbd> to navigate • <kbd className="bg-gray-800/50 px-1 rounded">Enter</kbd> to select • <kbd className="bg-gray-800/50 px-1 rounded">Esc</kbd> to close
          </p>
        </div>
      </div>
    </div>
  );
};

export default UniversalSearch;