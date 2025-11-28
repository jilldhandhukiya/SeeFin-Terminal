import React from 'react';

const Metric = ({ label, value, change, trend = 'up' }) => (
  <div className="flex flex-col justify-between h-full p-4 border-r border-gray-800 last:border-r-0 hover:bg-gray-900/30 transition-colors cursor-default group">
    <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider mb-1 group-hover:text-amber-500/70">{label}</span>
    <div className="flex items-baseline gap-2">
      <span className="text-2xl font-mono font-bold text-gray-100 tracking-tighter">{value}</span>
    </div>
    <div className={`flex items-center gap-1 text-xs font-mono font-medium ${change > 0 ? 'text-green-500' : 'text-red-500'}`}>
      {change > 0 ? '▲' : '▼'} {Math.abs(change)}%
      <span className="text-gray-600 ml-1">VAR</span>
    </div>
  </div>
);

export default Metric;