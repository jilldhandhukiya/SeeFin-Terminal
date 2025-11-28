import React from 'react';
import { Activity } from 'lucide-react';

const LoadingModule = ({ activeTab }) => {
  return (
    <div className="flex items-center justify-center h-full bg-black border border-gray-800">
      <div className="text-center">
        <Activity size={48} className="mx-auto text-gray-800 mb-4" />
        <h2 className="text-gray-500 font-mono text-sm uppercase">Module {activeTab} Loading...</h2>
        <p className="text-gray-700 text-xs mt-2 font-mono">Waiting for data stream</p>
      </div>
    </div>
  );
};

export default LoadingModule;