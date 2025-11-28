import React from 'react';

const CmdInput = ({ label, value, onChange, placeholder, type = "text" }) => (
  <div className="flex flex-col gap-1 w-full">
    {label && <label className="text-[9px] text-amber-600 font-mono uppercase">{label}</label>}
    <div className="flex items-center bg-gray-900 border-b border-gray-700 focus-within:border-amber-500 focus-within:bg-gray-800 transition-colors">
      <span className="pl-2 text-amber-500 text-xs font-mono">{'>'}</span>
      <input 
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-transparent border-none outline-none text-xs font-mono text-gray-200 p-2 placeholder:text-gray-700 uppercase"
      />
    </div>
  </div>
);

export default CmdInput;